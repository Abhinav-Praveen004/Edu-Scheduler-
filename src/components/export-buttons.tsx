"use client";

import { Download, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParsedTimetable } from "@/lib/types";
import { exportToCSV, exportToICal, exportToPDF } from "@/lib/export";

interface ExportButtonsProps {
  timetable: ParsedTimetable | null;
  className?: string;
}

export function ExportButtons({ timetable, className }: ExportButtonsProps) {
  if (!timetable) {
    return null;
  }

  const handleExportCSV = () => {
    if (timetable) exportToCSV(timetable);
  };
  
  const handleExportICal = () => {
    if (timetable) exportToICal(timetable);
  };
  
  const handleExportPDF = () => {
    if (timetable) exportToPDF(timetable);
  };


  return (
    <div className={className}>
      <div className="flex justify-center gap-4">
        <Button onClick={handleExportPDF} variant="outline" className="w-full justify-center bg-green-500 text-white hover:bg-green-600">
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
        <Button onClick={handleExportICal} variant="outline" className="w-full justify-center bg-blue-500 text-white hover:bg-blue-600">
          <Calendar className="mr-2 h-4 w-4" />
          Sync Calendar
        </Button>
        <Button onClick={handleExportCSV} variant="outline" className="w-full justify-center bg-gray-500 text-white hover:bg-gray-600">
          <FileText className="mr-2 h-4 w-4" />
          Export as CSV
        </Button>
      </div>
    </div>
  );
}
