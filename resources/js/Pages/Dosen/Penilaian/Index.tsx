import React from 'react';
import DosenLayout from '@/Layouts/DosenLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { 
    ClipboardList, 
    Edit, 
    CheckCircle, 
    Clock, 
    Printer
} from 'lucide-react';

interface Mahasiswa {
    id: number;
    name: string;
    nim: string;
}

interface Pendaftaran {
    id: number;
    mahasiswa: Mahasiswa;
    status_kp: string;
    is_dinilai: boolean;
    nilai_pembimbing: number | null;
    nilai_ujian: number | null;
    nilai_huruf?: string | null;
}

export default function Index({ auth, pendaftarans }: PageProps<{ pendaftarans: Pendaftaran[] }>) {
    return (
        <div className="flex-1 p-6 max-w-[1200px] mx-auto w-full">
            <Head title="Penilaian Mahasiswa" />
            
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-display-sm text-on-surface mb-2">Penilaian Mahasiswa</h1>
                    <p className="text-body-md text-secondary">
                        Daftar mahasiswa bimbingan yang telah masuk tahap penilaian Kerja Praktik (Formulir Resmi Berkas KP-6b).
                    </p>
                </div>
                <div className="bg-primary/10 p-3 rounded-xl">
                    <ClipboardList className="w-8 h-8 text-primary" />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-outline-variant overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-bold text-slate-600 uppercase tracking-wider">
                                <th className="px-5 py-3.5 text-center w-12">No</th>
                                <th className="px-5 py-3.5">Mahasiswa</th>
                                <th className="px-5 py-3.5 text-center">Nilai Ujian (Penguji)</th>
                                <th className="px-5 py-3.5 text-center">Nilai Bimbingan</th>
                                <th className="px-5 py-3.5 text-center">Nilai Huruf</th>
                                <th className="px-5 py-3.5 text-center">Status</th>
                                <th className="px-5 py-3.5 text-center w-48">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant text-sm">
                            {pendaftarans.length > 0 ? (
                                pendaftarans.map((p, index) => (
                                    <tr key={p.id} className="hover:bg-surface-container-lowest transition-colors">
                                        <td className="px-5 py-4 text-center text-secondary font-medium">{index + 1}</td>
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-on-surface">{p.mahasiswa?.name}</div>
                                            <div className="font-mono text-xs text-secondary mt-0.5">{p.mahasiswa?.nim}</div>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            {p.nilai_ujian !== null ? (
                                                <span className="font-bold text-slate-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md text-xs">
                                                    {Number(p.nilai_ujian).toFixed(2)}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            {p.nilai_pembimbing !== null ? (
                                                <span className="font-bold text-slate-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-xs">
                                                    {Number(p.nilai_pembimbing).toFixed(2)}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            {p.nilai_huruf ? (
                                                <span className="inline-flex items-center justify-center font-black text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                                    {p.nilai_huruf}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            {p.is_dinilai ? (
                                                <div className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-md text-xs font-semibold">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Sudah Dinilai
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md text-xs font-semibold">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Belum Dinilai
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={route('dosen.penilaian.create', p.id)}
                                                    className="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-lg font-bold hover:bg-primary/90 transition text-xs shadow-xs"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                    {p.is_dinilai ? 'Ubah Nilai' : 'Beri Nilai'}
                                                </Link>
                                                {p.is_dinilai && (
                                                    <a
                                                        href={route('dosen.penilaian.cetak', p.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="Cetak Berkas KP-6b"
                                                        className="inline-flex items-center gap-1 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg font-bold transition text-xs shadow-xs"
                                                    >
                                                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                                                        <span className="hidden sm:inline">KP-6b</span>
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-secondary">
                                        Tidak ada data mahasiswa bimbingan yang perlu dinilai.
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
