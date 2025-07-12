"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { formUrlQuery } from "@/lib/utils";

interface PaginationProps {
  page?: number;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export const Pagination = ({ page, totalPages, currentPage, onPageChange }: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams()!;

  // Use either the new props or the old ones for backward compatibility
  const currentPageNum = currentPage || page || 1;
  const totalPagesNum = totalPages || 1;

  const handleNavigation = (type: "prev" | "next") => {
    const pageNumber = type === "prev" ? currentPageNum - 1 : currentPageNum + 1;

    if (onPageChange) {
      // Use the callback if provided (for news page)
      onPageChange(pageNumber);
    } else {
      // Use URL-based navigation (for existing pages)
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "page",
        value: pageNumber.toString(),
      });

      router.push(newUrl, { scroll: false });
    }
  };

  return (
    <div className="flex justify-between gap-3">
      <Button
        size="lg"
        variant="ghost"
        className="p-0 hover:bg-transparent"
        onClick={() => handleNavigation("prev")}
        disabled={Number(currentPageNum) <= 1}
      >
        <Image
          src="/icons/arrow-left.svg"
          alt="arrow"
          width={20}
          height={20}
          className="mr-2"
        />
        Prev
      </Button>
      <p className="text-14 flex items-center px-2">
        {currentPageNum} / {totalPagesNum}
      </p>
      <Button
        size="lg"
        variant="ghost"
        className="p-0 hover:bg-transparent"
        onClick={() => handleNavigation("next")}
        disabled={Number(currentPageNum) >= totalPagesNum}
      >
        Next
        <Image
          src="/icons/arrow-left.svg"
          alt="arrow"
          width={20}
          height={20}
          className="ml-2 -scale-x-100"
        />
      </Button>
    </div>
  );
};
