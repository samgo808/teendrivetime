'use client';

import { useState } from 'react';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { Download, FileText, File } from 'lucide-react';
import jsPDF from 'jspdf';

export default function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToText = async () => {
    setIsExporting(true);
    try {
      const sessions = await db.driveSessions.orderBy('startTime').toArray();

      const totalHours = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
      const nightHours = sessions.filter(s => s.isNightDrive).reduce((sum, s) => sum + (s.duration || 0), 0) / 60;

      let text = '='.repeat(60) + '\n';
      text += 'TEEN DRIVE TIME - DRIVING LOG\n';
      text += '='.repeat(60) + '\n\n';
      text += `Total Hours: ${totalHours.toFixed(2)} / 50 hours\n`;
      text += `Night Hours: ${nightHours.toFixed(2)} / 10 hours\n`;
      text += `Day Hours: ${(totalHours - nightHours).toFixed(2)} hours\n`;
      text += `Total Drives: ${sessions.length}\n`;
      text += `Verified Drives: ${sessions.filter(s => s.verified).length}\n\n`;
      text += '='.repeat(60) + '\n';
      text += 'DRIVE SESSIONS\n';
      text += '='.repeat(60) + '\n\n';

      sessions.forEach((session, index) => {
        text += `Drive #${index + 1}\n`;
        text += `-`.repeat(60) + '\n';
        text += `Date: ${format(new Date(session.startTime), 'MMM dd, yyyy')}\n`;
        text += `Start Time: ${format(new Date(session.startTime), 'h:mm a')}\n`;
        text += `End Time: ${session.endTime ? format(new Date(session.endTime), 'h:mm a') : 'N/A'}\n`;
        text += `Duration: ${session.duration} minutes (${(session.duration! / 60).toFixed(2)} hours)\n`;
        text += `Distance: ${session.distance?.toFixed(2)} miles\n`;
        text += `Type: ${session.isNightDrive ? 'Night Drive' : 'Day Drive'}\n`;
        text += `Start Location: ${session.startLocation.address || `${session.startLocation.latitude.toFixed(4)}, ${session.startLocation.longitude.toFixed(4)}`}\n`;
        if (session.endLocation) {
          text += `End Location: ${session.endLocation.address || `${session.endLocation.latitude.toFixed(4)}, ${session.endLocation.longitude.toFixed(4)}`}\n`;
        }
        text += `Verified: ${session.verified ? 'Yes' : 'No'}\n`;
        if (session.verified && session.verifierInitials) {
          text += `Verifier Initials: ${session.verifierInitials}\n`;
        }
        if (session.comments) {
          text += `Comments: ${session.comments}\n`;
        }
        text += '\n';
      });

      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `drive-log-${format(new Date(), 'yyyy-MM-dd')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const sessions = await db.driveSessions.orderBy('startTime').toArray();

      const totalHours = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
      const nightHours = sessions.filter(s => s.isNightDrive).reduce((sum, s) => sum + (s.duration || 0), 0) / 60;

      const doc = new jsPDF();
      let yPos = 20;

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('TEEN DRIVE TIME - DRIVING LOG', 105, yPos, { align: 'center' });
      yPos += 15;

      // Summary
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Hours: ${totalHours.toFixed(2)} / 50 hours`, 20, yPos);
      yPos += 7;
      doc.text(`Night Hours: ${nightHours.toFixed(2)} / 10 hours`, 20, yPos);
      yPos += 7;
      doc.text(`Day Hours: ${(totalHours - nightHours).toFixed(2)} hours`, 20, yPos);
      yPos += 7;
      doc.text(`Total Drives: ${sessions.length}`, 20, yPos);
      yPos += 7;
      doc.text(`Verified Drives: ${sessions.filter(s => s.verified).length}`, 20, yPos);
      yPos += 15;

      // Sessions
      doc.setFont('helvetica', 'bold');
      doc.text('DRIVE SESSIONS', 20, yPos);
      yPos += 10;

      sessions.forEach((session, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`Drive #${index + 1} - ${format(new Date(session.startTime), 'MMM dd, yyyy')}`, 20, yPos);
        yPos += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Time: ${format(new Date(session.startTime), 'h:mm a')} - ${session.endTime ? format(new Date(session.endTime), 'h:mm a') : 'N/A'}`, 20, yPos);
        yPos += 5;
        doc.text(`Duration: ${session.duration} min (${(session.duration! / 60).toFixed(2)} hrs) | Distance: ${session.distance?.toFixed(2)} mi | Type: ${session.isNightDrive ? 'Night' : 'Day'}`, 20, yPos);
        yPos += 5;

        const startLoc = session.startLocation.address || `${session.startLocation.latitude.toFixed(4)}, ${session.startLocation.longitude.toFixed(4)}`;
        doc.text(`From: ${startLoc.substring(0, 70)}`, 20, yPos);
        yPos += 5;

        if (session.endLocation) {
          const endLoc = session.endLocation.address || `${session.endLocation.latitude.toFixed(4)}, ${session.endLocation.longitude.toFixed(4)}`;
          doc.text(`To: ${endLoc.substring(0, 70)}`, 20, yPos);
          yPos += 5;
        }

        if (session.verified && session.verifierInitials) {
          doc.text(`Verified by: ${session.verifierInitials}`, 20, yPos);
          yPos += 5;
        }

        if (session.comments) {
          doc.text(`Comments: ${session.comments.substring(0, 70)}`, 20, yPos);
          yPos += 5;
        }

        yPos += 5;
      });

      doc.save(`drive-log-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Export Data
        </h2>
        <Download className="w-6 h-6 text-blue-600" />
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
        Download your complete driving log with all sessions and verification details.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={exportToText}
          disabled={isExporting}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-md transition-colors"
        >
          <FileText className="w-5 h-5" />
          Export as TXT
        </button>
        <button
          onClick={exportToPDF}
          disabled={isExporting}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
        >
          <File className="w-5 h-5" />
          Export as PDF
        </button>
      </div>
    </div>
  );
}
