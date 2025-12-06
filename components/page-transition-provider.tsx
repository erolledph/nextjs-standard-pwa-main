'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// Configure NProgress
NProgress.configure({
	minimum: 0.3,
	easing: 'ease',
	speed: 500,
	showSpinner: false,
})

function PageTransitionEffect() {
	const pathname = usePathname()
	const searchParams = useSearchParams()

	useEffect(() => {
		NProgress.start()
		
		// Complete progress after page loads
		const timer = setTimeout(() => {
			NProgress.done()
		}, 500)

		return () => {
			clearTimeout(timer)
			NProgress.done()
		}
	}, [pathname, searchParams])

	return null
}

export function PageTransitionProvider() {
	return (
		<Suspense fallback={null}>
			<PageTransitionEffect />
		</Suspense>
	)
}
