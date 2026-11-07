import React, { useState, useMemo } from 'react';
import DosenLayout from '@/Layouts/DosenLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    FileCheck,
    FileText,
    Download,
    ExternalLink,
    Search,
    Calendar,
    Building2,
    Clock,
    User,
    CheckCircle2,
    FolderOpen,
} from 'lucide-react';

interface Mahasiswa {
    id: number;
    name: string;
    nim: string;
}

interface LaporanItem {
    id: number;
    dokumen_id: number;
    mahasiswa: Mahasiswa;
    instansi: string;
    nama_file: string;
    path: string;
    file_url: string | null;
    download_url: string | null;
    uploaded_at: string | null;
    uploaded_at_raw: string | null;
    status_kp: string;
}

interface Props extends PageProps {
    laporanList: LaporanItem[];
}

export default function Index({ auth, laporanList }: Props) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLaporan = useMemo(() => {
        if (!searchQuery.trim()) return laporanList;
        const q = searchQuery.toLowerCase();
        return laporanList.filter(
            (item) =>
                item.mahasiswa.name.toLowerCase().includes(q) ||
                item.mahasiswa.nim.toLowerCase().includes(q) ||
                item.instansi.toLowerCase().includes(q) ||
                item.nama_file.toLowerCase().includes(q)
        );
    }, [laporanList, searchQuery]);

    return (
        <div className="flex-1 p-6 max-w-[1240px] mx-auto w-full space-y-6">
            <Head title="Laporan Akhir Mahasiswa Bimbingan" />

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Berkas Tahap Akhir KP</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Laporan Akhir Mahasiswa</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Daftar berkas naskah Laporan Akhir Kerja Praktik yang telah diunggah oleh mahasiswa bimbingan Anda.
                    </p>
                </div>
                <div className="bg-primary/10 p-3 rounded-2xl shrink-0 self-start sm:self-center">
                    <FileCheck className="w-8 h-8 text-primary" />
                </div>
            </div>

            {/* Stats Summary Bento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Laporan Terkumpul</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{laporanList.length}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Mahasiswa bimbingan telah mengunggah</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-[#00288e] flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hasil Pencarian</p>
                        <p className="text-2xl font-bold text-emerald-700 mt-1">{filteredLaporan.length}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Sesuai kata kunci filter</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs sm:col-span-2 lg:col-span-1 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Format Dokumen</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">PDF Resmi</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Ukuran maksimal 5MB per berkas</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                        <FolderOpen className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filter / Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari berdasarkan nama mahasiswa, NIM, instansi, atau nama berkas..."
                        className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    />
                </div>
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-slate-500 hover:text-slate-700 font-semibold px-2 py-1 shrink-0 cursor-pointer"
                    >
                        Reset Filter
                    </button>
                )}
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                <th className="px-5 py-3.5 text-center w-12">No</th>
                                <th className="px-5 py-3.5">Mahasiswa</th>
                                <th className="px-5 py-3.5">Instansi Mitra</th>
                                <th className="px-5 py-3.5">Berkas Laporan Akhir</th>
                                <th className="px-5 py-3.5 text-center">Waktu Pengumpulan</th>
                                <th className="px-5 py-3.5 text-center w-48">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredLaporan.length > 0 ? (
                                filteredLaporan.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-5 py-4 text-center text-slate-400 font-semibold text-xs">
                                            {idx + 1}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-[#00288e] flex items-center justify-center font-bold text-xs shrink-0">
                                                    {item.mahasiswa.name?.substring(0, 2).toUpperCase() || 'MH'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-900 truncate">
                                                        {item.mahasiswa.name}
                                                    </p>
                                                    <p className="text-xs font-mono text-slate-500">
                                                        {item.mahasiswa.nim}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5 text-slate-700 text-xs font-medium">
                                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="truncate max-w-[200px]" title={item.instansi}>
                                                    {item.instansi}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                                                    <FileText className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-slate-900 truncate max-w-[220px]" title={item.nama_file}>
                                                        {item.nama_file}
                                                    </p>
                                                    <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded mt-0.5">
                                                        PDF
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            {item.uploaded_at ? (
                                                <div className="inline-flex items-center gap-1 text-slate-600 text-xs">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>{item.uploaded_at}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {/* Tombol Lihat Dokumen */}
                                                <a
                                                    href={item.download_url ?? (item.file_url ?? '#')}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title="Buka / Lihat Dokumen Laporan Akhir"
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00288e] hover:bg-blue-900 text-white font-semibold text-xs transition shadow-xs cursor-pointer"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    <span>Lihat Dokumen</span>
                                                </a>

                                                {/* Tombol Unduh Laporan */}
                                                <a
                                                    href={`${item.download_url ?? (item.file_url ?? '#')}?download=1`}
                                                    download
                                                    title="Unduh Berkas Laporan Akhir"
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer"
                                                >
                                                    <Download className="w-3.5 h-3.5 text-slate-600" />
                                                    <span className="hidden sm:inline">Unduh</span>
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="max-w-sm mx-auto flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                                                <FolderOpen className="w-6 h-6" />
                                            </div>
                                            <p className="font-bold text-sm text-slate-800">
                                                {searchQuery ? 'Tidak ada laporan yang cocok' : 'Belum Ada Laporan Akhir yang Diunggah'}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                {searchQuery
                                                    ? 'Coba gunakan kata kunci pencarian lain untuk menemukan mahasiswa atau berkas.'
                                                    : 'Mahasiswa bimbingan yang telah menyelesaikan tahapan logbook dan mengunggah Laporan Akhir KP akan otomatis tercantum di sini.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

Index.layout = (page: React.ReactNode) => <DosenLayout>{page}</DosenLayout>;

