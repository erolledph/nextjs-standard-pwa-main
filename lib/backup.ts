/**
 * Automated backup utilities for GitHub
 * Creates backups of important data in GitHub issues/gists
 * Zero external dependencies - uses GitHub REST API
 */

export interface BackupConfig {
  owner: string
  repo: string
  token: string
}

export interface BackupOptions {
  compress?: boolean
  includeMetadata?: boolean
  labels?: string[]
  description?: string
}

/**
 * Create a backup issue on GitHub
 */
async function createBackupIssue(
  config: BackupConfig,
  title: string,
  content: string,
  options?: BackupOptions
): Promise<{ id: number; url: string }> {
  const response = await fetch(
    `https://api.github.com/repos/${config.owner}/${config.repo}/issues`,
    {
      method: 'POST',
      headers: {
        Authorization: `token ${config.token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        title: `[BACKUP] ${title}`,
        body: content,
        labels: ['backup', ...(options?.labels || [])],
        state: 'closed' // Close immediately - it's just a backup
      })
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to create backup issue: ${response.statusText}`)
  }

  const data = (await response.json()) as any
  return {
    id: data.number,
    url: data.html_url
  }
}

/**
 * Backup JSON data to GitHub
 */
export async function backupDataToGitHub(
  config: BackupConfig,
  dataName: string,
  data: any,
  options?: BackupOptions
): Promise<{ issueNumber: number; url: string; timestamp: string }> {
  const timestamp = new Date().toISOString()
  const backup = {
    timestamp,
    dataName,
    ...data,
    ...(options?.includeMetadata && {
      _metadata: {
        backedUp: timestamp,
        nodeEnv: process.env.NODE_ENV,
        hostname: process.env.HOSTNAME || 'unknown'
      }
    })
  }

  const content = `\`\`\`json\n${JSON.stringify(backup, null, 2)}\n\`\`\``
  const issue = await createBackupIssue(config, `${dataName} Backup`, content, options)

  return {
    issueNumber: issue.id,
    url: issue.url,
    timestamp
  }
}

/**
 * Backup database snapshot
 */
export async function backupDatabase(
  config: BackupConfig,
  dbSnapshot: Record<string, any>,
  collectionName: string
): Promise<{ issueNumber: number; url: string }> {
  const timestamp = new Date().toISOString()
  const size = JSON.stringify(dbSnapshot).length

  const content = `
## Database Backup: ${collectionName}

**Timestamp:** ${timestamp}  
**Records:** ${Object.keys(dbSnapshot).length}  
**Size:** ${(size / 1024).toFixed(2)} KB

\`\`\`json
${JSON.stringify(dbSnapshot, null, 2)}
\`\`\`
  `.trim()

  const issue = await createBackupIssue(config, `Database: ${collectionName}`, content, {
    labels: ['database', 'backup', collectionName]
  })
  return {
    issueNumber: issue.id,
    url: issue.url
  }
}

/**
 * Backup error logs
 */
export async function backupErrorLogs(
  config: BackupConfig,
  errors: Array<{ timestamp: string; message: string; stack?: string }>,
  source: string
): Promise<{ issueNumber: number; url: string }> {
  if (errors.length === 0) {
    return {
      issueNumber: 0,
      url: ''
    }
  }

  const content = `
## Error Log Backup: ${source}

**Timestamp:** ${new Date().toISOString()}  
**Error Count:** ${errors.length}

${errors
  .map(
    (err, idx) => `
### Error ${idx + 1}
**Time:** ${err.timestamp}  
**Message:** ${err.message}

${err.stack ? `\`\`\`\n${err.stack}\n\`\`\`` : ''}
`
  )
  .join('\n')}
  `.trim()

  const issue = await createBackupIssue(config, `Errors: ${source}`, content, {
    labels: ['error-log', source]
  })
  return {
    issueNumber: issue.id,
    url: issue.url
  }
}

/**
 * Backup user data (for GDPR compliance)
 */
export async function backupUserData(
  config: BackupConfig,
  userId: string,
  userData: Record<string, any>
): Promise<{ issueNumber: number; url: string; timestamp: string }> {
  const timestamp = new Date().toISOString()

  // Sanitize sensitive data
  const sanitized = {
    userId,
    ...userData,
    _backup_timestamp: timestamp,
    _backup_reason: 'user_request_or_audit'
  }

  const content = `
## User Data Backup

**User ID:** ${userId}  
**Timestamp:** ${timestamp}

\`\`\`json
${JSON.stringify(sanitized, null, 2)}
\`\`\`

**Note:** This is an automated backup. All PII should be handled according to GDPR/privacy regulations.
  `.trim()

  const issue = await createBackupIssue(config, `User Data: ${userId}`, content, {
    labels: ['user-data', 'gdpr', userId]
  })

  return {
    issueNumber: issue.id,
    url: issue.url,
    timestamp
  }
}

/**
 * Backup configuration snapshots
 */
export async function backupConfig(
  config: BackupConfig,
  configData: Record<string, any>,
  configName: string
): Promise<{ issueNumber: number; url: string }> {
  // Never backup secrets
  const sanitized = { ...configData }
  delete (sanitized as any).GITHUB_TOKEN
  delete (sanitized as any).FIREBASE_PRIVATE_KEY
  delete (sanitized as any).GEMINI_API_KEY
  delete (sanitized as any).ADMIN_PASSWORD

  const content = `
## Configuration Backup: ${configName}

**Timestamp:** ${new Date().toISOString()}

\`\`\`json
${JSON.stringify(sanitized, null, 2)}
\`\`\`

**Security Note:** Sensitive keys have been excluded from this backup.
  `.trim()

  const issue = await createBackupIssue(config, `Config: ${configName}`, content, {
    labels: ['config', configName]
  })
  return {
    issueNumber: issue.id,
    url: issue.url
  }
}

/**
 * Restore backup from GitHub issue
 */
export async function restoreBackupFromGitHub(
  config: BackupConfig,
  issueNumber: number
): Promise<any> {
  const response = await fetch(
    `https://api.github.com/repos/${config.owner}/${config.repo}/issues/${issueNumber}`,
    {
      headers: {
        Authorization: `token ${config.token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch backup: ${response.statusText}`)
  }

  const issue = (await response.json()) as any

  // Extract JSON from code block
  const jsonMatch = issue.body.match(/```json\n([\s\S]*?)\n```/)
  if (!jsonMatch) {
    throw new Error('No JSON found in backup issue')
  }

  return JSON.parse(jsonMatch[1])
}

/**
 * List all backups
 */
export async function listBackups(
  config: BackupConfig,
  label?: string
): Promise<
  Array<{
    number: number
    title: string
    url: string
    createdAt: string
  }>
> {
  const query = `repo:${config.owner}/${config.repo} label:backup ${label ? `label:${label}` : ''}`

  const response = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(query)}`, {
    headers: {
      Authorization: `token ${config.token}`,
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to list backups: ${response.statusText}`)
  }

  const data = (await response.json()) as any

  return data.items.map((item: any) => ({
    number: item.number,
    title: item.title.replace('[BACKUP] ', ''),
    url: item.html_url,
    createdAt: item.created_at
  }))
}

/**
 * Delete old backups (retention policy)
 */
export async function cleanupOldBackups(
  config: BackupConfig,
  retentionDays: number = 30
): Promise<{ deleted: number; errors: string[] }> {
  const backups = await listBackups(config)
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)
  const toDelete = backups.filter((b) => new Date(b.createdAt) < cutoffDate)

  const results = { deleted: 0, errors: [] as string[] }

  for (const backup of toDelete) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/issues/${backup.number}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `token ${config.token}`,
            'Content-Type': 'application/json',
            'X-GitHub-Api-Version': '2022-11-28'
          },
          body: JSON.stringify({
            state: 'closed',
            labels: ['backup', 'deleted']
          })
        }
      )

      if (response.ok) {
        results.deleted++
      } else {
        results.errors.push(`Failed to delete backup ${backup.number}`)
      }
    } catch (error) {
      results.errors.push(`Error deleting backup ${backup.number}: ${String(error)}`)
    }
  }

  return results
}

export default {
  backupDataToGitHub,
  backupDatabase,
  backupErrorLogs,
  backupUserData,
  backupConfig,
  restoreBackupFromGitHub,
  listBackups,
  cleanupOldBackups
}
