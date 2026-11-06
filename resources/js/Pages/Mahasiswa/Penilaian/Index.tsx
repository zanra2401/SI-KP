import React, { useMemo } from 'react';
import MahasiswaLayout from '@/Layouts/MahasiswaLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Award, Printer, CheckCircle, FileText, AlertCircle, Building, MessageSquareQuote } from 'lucide-react';
import PageHeader from '@/Components/PageHeader';
import ModernTable, { ModernTableHeader, ModernTableTh, ModernTableBody, ModernTableTd } from '@/Components/ModernTable';

interface RincianNilai {
    komponen: string;
    bobot: number;
    nilai: number;
}

interface RaporData {
    mahasiswa: any;
    status_kp: string;
    dosen_pembimbing: string;
    instansi: string;
    agregat_dosen: number | null;
    agregat_instansi: number | null;
    agregat_ujian: number | null;
    nilai_total: number | null;
    nilai_huruf: string;
    status_lulus: string;
    catatan: string | null;
    catatan_dosen?: string | null;
    catatan_instansi?: string | null;
    rincian_dosen: RincianNilai[];
    rincian_instansi: RincianNilai[];
}

interface PenilaianProps extends PageProps {
    hasData: boolean;
    message?: string;
    rapor?: RaporData;
}

export default function Index({ hasData, message, rapor }: PenilaianProps) {
    const parsedNotes = useMemo(() => {
        let dosen = rapor?.catatan_dosen || null;
        let instansi = rapor?.catatan_instansi || null;
        let umumList: string[] = [];

        // Parse string catatan baris per baris secara ketat
        const raw = rapor?.catatan || '';
        if (raw) {
            const lines = raw.split(/\r?\n/);
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                // Abaikan baris metadata serialisasi JSON huruf
                if (/^\[(Dosen|Instansi)_Huruf\]:/i.test(trimmed)) continue;

                // Abaikan jika terdapat sisa pecahan string JSON
                if (
                    trimmed.startsWith('{') ||
                    trimmed.startsWith('}') ||
                    trimmed.startsWith(',"') ||
                    trimmed.endsWith('"}') ||
                    trimmed.includes('"bimbingan":') ||
                    trimmed.includes('"ujian":') ||
                    trimmed.includes('"total":')
                ) {
                    continue;
                }

                if (/^\[Dosen Pembimbing\]:\s*/i.test(trimmed)) {
                    if (!dosen) {
                        const val = trimmed.replace(/^\[Dosen Pembimbing\]:\s*/i, '').trim();
                        if (val) dosen = val;
                    }
                    continue;
                }

                if (/^\[Instansi\]:\s*/i.test(trimmed)) {
                    if (!instansi) {
                        const val = trimmed.replace(/^\[Instansi\]:\s*/i, '').trim();
                        if (val) instansi = val;
                    }
                    continue;
                }

                umumList.push(trimmed);
            }
        }

        const umum = umumList.length > 0 ? umumList.join('\n') : null;
        const hasAny = Boolean(dosen || instansi || umum);
        return { dosen, instansi, umum, hasAny };
    }, [rapor]);

    if (!hasData || !rapor) {
        return (
            <div className="flex-1 p-6 max-w-[1200px] mx-auto w-full space-y-6">
                <Head title="Penilaian Kerja Praktik" />
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm">
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                    <div>
                        <p className="font-bold">Informasi</p>
                        <p className="text-sm">{message || 'Data pendaftaran belum tersedia.'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-6 max-w-[1200px] mx-auto w-full space-y-6">
            <Head title="Hasil Penilaian Kerja Praktik" />
            
            <PageHeader title="Tahap 9: Penilaian & Kelulusan Akhir" description="Rincian hasil evaluasi nilai Kerja Praktik dari Dosen dan Instansi.">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-700">
                    <Award className="w-7 h-7" />
                </div>
            </PageHeader>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-800">Rapor Kerja Praktik</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Instansi: <span className="font-semibold text-slate-700">{rapor.instansi}</span> | Dosen: <span className="font-semibold text-slate-700">{rapor.dosen_pembimbing}</span></p>
                    </div>
                    
                    {(rapor.rincian_dosen.length > 0 || rapor.rincian_instansi.length > 0) && (
                        <div className="flex flex-wrap gap-2.5 shrink-0">
                            <a
                                href={route('mahasiswa.penilaian.cetak')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-[#00288e] hover:bg-blue-800 text-white px-3.5 py-2 rounded-lg font-semibold transition-colors text-xs shadow-sm"
                            >
                                <Printer className="w-4 h-4" />
                                Cetak Nilai Akhir
                            </a>
                            
                            {rapor.rincian_dosen.length > 0 && (
                                <a
                                    href={route('mahasiswa.penilaian.cetak-dosen')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 bg-white border border-blue-200 text-[#00288e] px-3.5 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-xs shadow-xs"
                                >
                                    <Printer className="w-4 h-4" />
                                    Berkas KP-6b (Dosen)
                                </a>
                            )}

                            {rapor.rincian_instansi.length > 0 && (
                                <a
                                    href={route('mahasiswa.penilaian.cetak-instansi')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 px-3.5 py-2 rounded-lg font-semibold hover:bg-slate-50 transition-colors text-xs shadow-xs"
                                >
                                    <Printer className="w-4 h-4" />
                                    Berkas KP-6a (Instansi)
                                </a>
                            )}

                            <Link
                                href="/mahasiswa/berita-acara"
                                className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 px-3.5 py-2 rounded-lg font-semibold transition-colors text-xs shadow-xs"
                            >
                                <FileText className="w-4 h-4" />
                                Berita Acara (Form KP-5)
                            </Link>
                        </div>
                    )}
                </div>

                <div className="p-6">
                    {rapor.rincian_dosen.length === 0 && rapor.rincian_instansi.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-base font-bold text-slate-900">Penilaian Masih Diproses</h3>
                            <p className="text-xs text-slate-500 mt-2">Dosen atau Instansi belum melengkapi komponen nilai Anda.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Dosen Pembimbing Section */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                                        Nilai Dosen Pembimbing (30%)
                                    </h3>
                                    {rapor.rincian_dosen.length > 0 ? (
                                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                            <ModernTable>
                                                <ModernTableHeader>
                                                    <tr>
                                                        <ModernTableTh>Komponen</ModernTableTh>
                                                        <ModernTableTh>Nilai (0-100)</ModernTableTh>
                                                    </tr>
                                                </ModernTableHeader>
                                                <ModernTableBody>
                                                    {rapor.rincian_dosen.map((n, i) => (
                                                        <tr key={i}>
                                                            <ModernTableTd>{n.komponen}</ModernTableTd>
                                                            <ModernTableTd>{n.nilai}</ModernTableTd>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-slate-50 font-semibold">
                                                        <ModernTableTd>Rata-rata/Agregat Dosen</ModernTableTd>
                                                        <ModernTableTd>{rapor.agregat_dosen}</ModernTableTd>
                                                    </tr>
                                                </ModernTableBody>
                                            </ModernTable>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500 italic">Belum ada rincian nilai dosen.</p>
                                    )}
                                </div>

                                {/* Instansi Section */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                                        Nilai Instansi (30%)
                                    </h3>
                                    {rapor.rincian_instansi.length > 0 ? (
                                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                            <ModernTable>
                                                <ModernTableHeader>
                                                    <tr>
                                                        <ModernTableTh>Komponen</ModernTableTh>
                                                        <ModernTableTh>Nilai (0-100)</ModernTableTh>
                                                    </tr>
                                                </ModernTableHeader>
                                                <ModernTableBody>
                                                    {rapor.rincian_instansi.map((n, i) => (
                                                        <tr key={i}>
                                                            <ModernTableTd>{n.komponen}</ModernTableTd>
                                                            <ModernTableTd>{n.nilai}</ModernTableTd>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-slate-50 font-semibold">
                                                        <ModernTableTd>Rata-rata/Agregat Instansi</ModernTableTd>
                                                        <ModernTableTd>{rapor.agregat_instansi}</ModernTableTd>
                                                    </tr>
                                                </ModernTableBody>
                                            </ModernTable>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500 italic">Belum ada rincian nilai instansi.</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center shadow-xs">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Nilai Akhir</h3>
                                    <div className="text-4xl text-[#00288e] font-extrabold mb-2">{rapor.nilai_total !== null ? rapor.nilai_total : '-'}</div>
                                    <div className="inline-block bg-[#00288e] text-white px-3 py-1 rounded-md text-xs font-bold mb-3 shadow-2xs">
                                        Grade {rapor.nilai_huruf}
                                    </div>
                                    <div className="text-xs font-medium text-slate-500">
                                        Status: <span className={`font-bold ${rapor.status_lulus === 'lulus' ? 'text-emerald-600' : 'text-rose-600'}`}>{rapor.status_lulus.toUpperCase()}</span>
                                    </div>
                                </div>
                                
                                {/* Card Catatan Evaluasi */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                                    <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#00288e] shrink-0">
                                                <MessageSquareQuote className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Catatan Evaluasi</h3>
                                                <p className="text-[10px] text-slate-500">Masukan & umpan balik pembimbing</p>
                                            </div>
                                        </div>
                                        {parsedNotes.hasAny && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#00288e] border border-blue-100">
                                                Tersedia
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-4 sm:p-5 space-y-3.5">
                                        {parsedNotes.hasAny ? (
                                            <>
                                                {parsedNotes.dosen && (
                                                    <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                                <Award className="w-3.5 h-3.5" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Dosen Pembimbing</span>
                                                                <p className="text-xs font-semibold text-slate-800 truncate">{rapor.dosen_pembimbing}</p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                            “{parsedNotes.dosen}”
                                                        </div>
                                                    </div>
                                                )}

                                                {parsedNotes.instansi && (
                                                    <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl space-y-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                                <Building className="w-3.5 h-3.5" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">Pembimbing Lapangan</span>
                                                                <p className="text-xs font-semibold text-slate-800 truncate">{rapor.instansi}</p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-white/90 p-2.5 rounded-lg border border-blue-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                            “{parsedNotes.instansi}”
                                                        </div>
                                                    </div>
                                                )}

                                                {parsedNotes.umum && (
                                                    <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                                <FileText className="w-3.5 h-3.5" />
                                                            </div>
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Catatan Nilai Akhir</span>
                                                        </div>
                                                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                            {parsedNotes.umum}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-4 px-2">
                                                <MessageSquareQuote className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                <p className="text-xs font-bold text-slate-700">Belum Ada Catatan Evaluasi Khusus</p>
                                                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                                    Dosen pembimbing dan pembimbing lapangan tidak menyematkan catatan tambahan pada penilaian akhir ini.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

Index.layout = (page: React.ReactNode) => <MahasiswaLayout>{page}</MahasiswaLayout>;
