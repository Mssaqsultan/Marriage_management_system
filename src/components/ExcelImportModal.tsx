import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  X, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Sparkles,
  ArrowRight,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { db } from '../services/db';
import { Guest, RelationType, SideType } from '../types';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (importedCount: number) => void;
  onSuccessToast?: (msg: string) => void;
}

interface ParsedGuestRow {
  name: string;
  father_husband_name?: string;
  mobile?: string;
  village?: string;
  relation: RelationType;
  side: SideType;
  notes?: string;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSuccessToast
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedGuestRow[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    processFile(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) processFile(dropped);
  };

  const processFile = async (fileObj: File) => {
    setFile(fileObj);
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const buffer = await fileObj.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!json || json.length === 0) {
        setErrorMsg('The selected Excel/CSV file is empty.');
        setIsProcessing(false);
        return;
      }

      // Smart Column Mapping
      const rows: ParsedGuestRow[] = [];

      json.forEach((row) => {
        // Find name column
        const nameKey = Object.keys(row).find(k => 
          /name|guest|mehmaan|naam|person/i.test(k) && !/father|husband/i.test(k)
        );
        const nameVal = nameKey ? String(row[nameKey]).trim() : '';

        if (!nameVal) return; // Skip empty rows

        // Find father / husband
        const fatherKey = Object.keys(row).find(k => /father|husband|pita|pati|s\/o|w\/o|d\/o/i.test(k));
        const fatherVal = fatherKey ? String(row[fatherKey]).trim() : undefined;

        // Find mobile
        const mobileKey = Object.keys(row).find(k => /mobile|phone|contact|number|cell/i.test(k));
        const mobileVal = mobileKey ? String(row[mobileKey]).replace(/[^0-9]/g, '').trim() : undefined;

        // Find village / address
        const villageKey = Object.keys(row).find(k => /village|gaon|city|address|pata|town/i.test(k));
        const villageVal = villageKey ? String(row[villageKey]).trim() : undefined;

        // Find relation
        const relKey = Object.keys(row).find(k => /relation|rishta|sambandh|type/i.test(k));
        let relVal: RelationType = 'Relative';
        if (relKey && row[relKey]) {
          const rStr = String(row[relKey]).toLowerCase();
          if (rStr.includes('mama')) relVal = 'Mama';
          else if (rStr.includes('chacha')) relVal = 'Chacha';
          else if (rStr.includes('bua')) relVal = 'Bua';
          else if (rStr.includes('fufa')) relVal = 'Fufa';
          else if (rStr.includes('tau')) relVal = 'Tau';
          else if (rStr.includes('friend') || rStr.includes('dost')) relVal = 'Friend';
          else if (rStr.includes('neighbor') || rStr.includes('padosi')) relVal = 'Neighbor';
          else if (rStr.includes('partner') || rStr.includes('business')) relVal = 'Business Partner';
          else if (rStr.includes('brother') || rStr.includes('bhai')) relVal = 'Brother';
          else if (rStr.includes('sister') || rStr.includes('behan')) relVal = 'Sister';
          else relVal = 'Relative';
        }

        // Find side
        const sideKey = Object.keys(row).find(k => /side|paksh|dulha|dulhan|groom|bride/i.test(k));
        let sideVal: SideType = 'Groom Side';
        if (sideKey && row[sideKey]) {
          const sStr = String(row[sideKey]).toLowerCase();
          if (sStr.includes('bride') || sStr.includes('dulhan') || sStr.includes('ladki')) {
            sideVal = 'Bride Side';
          } else if (sStr.includes('host')) {
            sideVal = 'Host Side';
          } else {
            sideVal = 'Groom Side';
          }
        }

        // Find notes
        const notesKey = Object.keys(row).find(k => /note|remark|shagun|invitation/i.test(k));
        const notesVal = notesKey ? String(row[notesKey]).trim() : undefined;

        rows.push({
          name: nameVal,
          father_husband_name: fatherVal,
          mobile: mobileVal,
          village: villageVal,
          relation: relVal,
          side: sideVal,
          notes: notesVal
        });
      });

      if (rows.length === 0) {
        setErrorMsg('Could not find any guest rows with names. Please check your Excel column headers.');
      } else {
        setParsedRows(rows);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed to parse file: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportSubmit = () => {
    if (parsedRows.length === 0) return;

    let importedCount = 0;
    parsedRows.forEach(row => {
      db.addGuest({
        name: row.name,
        father_husband_name: row.father_husband_name,
        mobile: row.mobile,
        village: row.village,
        relation: row.relation,
        side: row.side,
        notes: row.notes
      });
      importedCount++;
    });

    if (onSuccessToast) {
      onSuccessToast(`🎉 Successfully imported ${importedCount} Mehmaan (Guests) into database!`);
    }

    onSuccess(importedCount);
    onClose();
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        "Guest Name": "Mohammad Aslam",
        "Father / Husband": "Haji Noor Mohammad",
        "Mobile": "9876543210",
        "Village / City": "Chauriya khas",
        "Relation": "Close Relative",
        "Side": "Groom Side",
        "Remarks": "Card Given with dry fruits box"
      },
      {
        "Guest Name": "Ramesh Kumar Sharma",
        "Father / Husband": "Late Sh. Ram Prasad",
        "Mobile": "9812345678",
        "Village / City": "Lucknow",
        "Relation": "Friend",
        "Side": "Groom Side",
        "Remarks": "Invited with family"
      },
      {
        "Guest Name": "Fatima Begum",
        "Father / Husband": "W/o Asif Khan",
        "Mobile": "9988776655",
        "Village / City": "Gorakhpur",
        "Relation": "Relative",
        "Side": "Bride Side",
        "Remarks": "Phuphi"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mehmaan_Template");
    XLSX.writeFile(wb, "Mehmaan_Guest_List_Sample_Template.xlsx");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="royal-glass w-full max-w-3xl rounded-3xl border-2 border-amber-500/50 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-emerald-600/15 via-amber-600/15 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xl shadow-md">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black font-cinzel">
                  Excel / CSV Guest List Import
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  Bulk
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-semibold">
                Import 300-500+ mehmaan wedding card lists in 1-Click
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Upload Dropzone */}
          {!file && (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-amber-500/60 hover:border-amber-500 hover:bg-amber-500/10 rounded-3xl text-center cursor-pointer transition-all space-y-3 bg-neutral-50/50 dark:bg-neutral-900/50"
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".xlsx, .xls, .csv" 
                className="hidden" 
                onChange={handleFileChange}
              />
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200">
                  Click to select or Drag & Drop Excel / CSV file
                </h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Supports .xlsx, .xls, and .csv files from Excel, Google Sheets, or Numbers
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadSampleTemplate();
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 inline-flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample Excel Template</span>
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Rows Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-xs font-black uppercase text-neutral-700 dark:text-neutral-300 tracking-wider">
                    Found {parsedRows.length} Mehmaan in "{file?.name}"
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setParsedRows([]);
                  }}
                  className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 underline cursor-pointer"
                >
                  Choose different file
                </button>
              </div>

              {/* Table Preview (First 8 rows) */}
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold sticky top-0">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Guest Name</th>
                      <th className="p-2.5">Father / S/o</th>
                      <th className="p-2.5">Mobile</th>
                      <th className="p-2.5">Village</th>
                      <th className="p-2.5">Relation</th>
                      <th className="p-2.5">Side</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-800 dark:text-neutral-200">
                    {parsedRows.slice(0, 10).map((r, i) => (
                      <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                        <td className="p-2.5 text-neutral-400 font-mono">{i + 1}</td>
                        <td className="p-2.5 font-bold text-amber-900 dark:text-amber-300">{r.name}</td>
                        <td className="p-2.5 text-neutral-500">{r.father_husband_name || '-'}</td>
                        <td className="p-2.5 font-mono text-neutral-600 dark:text-neutral-400">{r.mobile || '-'}</td>
                        <td className="p-2.5">{r.village || '-'}</td>
                        <td className="p-2.5 text-[11px]">{r.relation}</td>
                        <td className="p-2.5 text-[11px]">
                          <span className={`px-2 py-0.5 rounded-full font-bold ${
                            r.side === 'Groom Side' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300'
                          }`}>
                            {r.side}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 10 && (
                <p className="text-[11px] text-neutral-500 text-right">
                  + {parsedRows.length - 10} more mehmaan will be imported...
                </p>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 bg-neutral-50 dark:bg-neutral-900/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleImportSubmit}
            disabled={parsedRows.length === 0 || isProcessing}
            className="gold-gradient-btn px-7 py-2.5 rounded-xl text-xs font-black shadow-lg hover:scale-102 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Import All {parsedRows.length} Guests (सभी इंपोर्ट करें)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
