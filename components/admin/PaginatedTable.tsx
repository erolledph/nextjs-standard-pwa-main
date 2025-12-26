"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface Column<T> {
  key: string
  header: string
  hideOnMobile?: boolean
  render?: (item: T) => React.ReactNode
}

interface PaginatedTableProps<T> {
  data: T[]
  columns: Column<T>[]
  pageSize?: number
}

export function PaginatedTable<T extends { id?: string; [key: string]: any }>({
  data,
  columns,
  pageSize = 10,
}: PaginatedTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(pageSize)

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  // Calculate which page numbers to show (max 5 pages)
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxPagesToShow; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  const handleItemsPerPageChange = (newPageSize: number) => {
    setItemsPerPage(newPageSize)
    setCurrentPage(1)
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`text-left px-3 sm:px-4 py-3 font-semibold text-foreground ${
                    column.hideOnMobile ? "hidden sm:table-cell" : ""
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, idx) => (
              <tr key={item.id || idx} className="border-b border-border hover:bg-muted/20 transition-colors">
                {columns.map((column) => (
                  <td
                    key={`${item.id || idx}-${column.key}`}
                    className={`px-3 sm:px-4 py-3 ${column.hideOnMobile ? "hidden sm:table-cell" : ""}`}
                  >
                    {column.render ? column.render(item) : (item[column.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Items Per Page */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Items per page:</span>
          <div className="flex gap-2">
            {[10, 20, 50].map((size) => (
              <Button
                key={size}
                variant={itemsPerPage === size ? "default" : "outline"}
                size="sm"
                onClick={() => handleItemsPerPageChange(size)}
                className="h-8 px-3 text-xs"
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        {/* Page Info */}
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages} ({data.length} total)
        </div>
      </div>

      {/* Page Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {pageNumbers.map((page, idx) => (
          <div key={idx}>
            {page === "..." ? (
              <span className="px-2 text-muted-foreground">…</span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page as number)}
                className="h-8 w-8 p-0 text-xs"
              >
                {page}
              </Button>
            )}
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
