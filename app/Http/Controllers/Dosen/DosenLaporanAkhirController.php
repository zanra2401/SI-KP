<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\DokumenAkhir;
use App\Models\Pendaftaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DosenLaporanAkhirController extends Controller
{
    /**
     * Tampilkan daftar Laporan Akhir KP mahasiswa bimbingan dosen.
     */
    public function index(Request $request): Response
    {
        $dosenId = Auth::id();

        // Query pendaftaran mahasiswa bimbingan dosen yang sudah mengunggah laporan akhir
        $pendaftarans = Pendaftaran::with([
            'mahasiswa',
            'instansi',
            'dokumenAkhirs' => function ($q) {
                $q->where('jenis', 'laporan_akhir')->latest('uploaded_at');
            }
        ])
        ->where(function ($q) use ($dosenId) {
            $q->where('dosen_pembimbing_id', $dosenId)
              ->orWhereHas('mahasiswa', fn($mq) => $mq->where('dosen_wali_id', $dosenId));
        })
        ->whereHas('dokumenAkhirs', function ($q) {
            $q->where('jenis', 'laporan_akhir');
        })
        ->latest('updated_at')
        ->get();

        $laporanList = $pendaftarans->map(function ($p) {
            // Ambil dokumen laporan akhir terbaru
            $doc = $p->dokumenAkhirs->first();

            return [
                'id' => $p->id,
                'dokumen_id' => $doc?->id,
                'mahasiswa' => [
                    'id' => $p->mahasiswa?->id,
                    'name' => $p->mahasiswa?->name ?? 'Mahasiswa',
                    'nim' => $p->mahasiswa?->nim ?? '-',
                ],
                'instansi' => $p->instansi?->nama ?? '-',
                'nama_file' => $doc?->nama_file ?? 'Laporan_Akhir.pdf',
                'path' => $doc?->path,
                'file_url' => $doc?->path ? asset('storage/' . $doc->path) : null,
                'download_url' => $doc ? route('dosen.laporan-akhir.download', $doc->id) : null,
                'uploaded_at' => $doc?->uploaded_at ? $doc->uploaded_at->translatedFormat('d F Y, H:i') : null,
                'uploaded_at_raw' => $doc?->uploaded_at?->toIso8601String(),
                'status_kp' => $p->status,
            ];
        });

        return Inertia::render('Dosen/LaporanAkhir/Index', [
            'laporanList' => $laporanList,
        ]);
    }

    /**
     * Download atau preview file laporan akhir secara aman bagi dosen pembimbing.
     */
    public function download(Request $request, $id)
    {
        $dosenId = Auth::id();

        $dokumen = DokumenAkhir::with('pendaftaran.mahasiswa')->findOrFail($id);
        $pendaftaran = $dokumen->pendaftaran;

        $isAuthorized = $pendaftaran && (
            $pendaftaran->dosen_pembimbing_id === $dosenId ||
            $pendaftaran->mahasiswa?->dosen_wali_id === $dosenId ||
            Auth::user()->is_superadmin ||
            Auth::user()->is_root
        );

        if (!$isAuthorized) {
            abort(403, 'Anda tidak memiliki wewenang untuk mengakses dokumen mahasiswa ini.');
        }

        if (!Storage::disk('public')->exists($dokumen->path)) {
            abort(404, 'File laporan akhir tidak ditemukan pada server penyimpanan.');
        }

        $disposition = $request->boolean('download') ? 'attachment' : 'inline';

        return Storage::disk('public')->response($dokumen->path, $dokumen->nama_file, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => $disposition . '; filename="' . $dokumen->nama_file . '"',
        ]);
    }
}

