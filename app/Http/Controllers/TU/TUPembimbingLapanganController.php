<?php

namespace App\Http\Controllers\TU;

use App\Http\Controllers\Controller;
use App\Models\Instansi;
use App\Models\PembimbingLapangan;
use App\Models\Pendaftaran;
use App\Models\User;
use App\Services\PembimbingLapanganService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TUPembimbingLapanganController extends Controller
{
    /**
     * Display a listing of Pembimbing Lapangan accounts.
     */
    public function index(Request $request): Response
    {
        $statusFilter = $request->query('status', 'all');
        $search = $request->query('search', '');

        $query = PembimbingLapangan::with([
            'user',
            'instansi',
            'pendaftarans.mahasiswa',
        ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('email', 'like', "%{$search}%")
                         ->orWhere('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('instansi', function ($iq) use ($search) {
                      $iq->where('nama', 'like', "%{$search}%");
                  });
            });
        }

        if ($statusFilter && $statusFilter !== 'all') {
            $query->whereHas('user', function ($uq) use ($statusFilter) {
                $uq->where('status_akun', $statusFilter);
            });
        }

        $pembimbingLapangans = $query->latest()->paginate(10)->withQueryString();

        // Calculate statistics
        $totalPl = PembimbingLapangan::count();
        $aktifPl = PembimbingLapangan::whereHas('user', fn($q) => $q->where('status_akun', 'aktif'))->count();
        $pendingPl = PembimbingLapangan::whereHas('user', fn($q) => $q->where('status_akun', 'pending'))->count();
        $nonaktifPl = PembimbingLapangan::whereHas('user', fn($q) => $q->where('status_akun', 'ditolak'))->count();
        $belumKlaim = PembimbingLapangan::whereNull('user_id')->count();

        return Inertia::render('TU/PembimbingLapangan/Index', [
            'pembimbingLapangans' => $pembimbingLapangans,
            'instansis' => Instansi::orderBy('nama')->get(['id', 'nama', 'alamat']),
            'stats' => [
                'total' => $totalPl,
                'aktif' => $aktifPl,
                'pending' => $pendingPl,
                'nonaktif' => $nonaktifPl,
                'belum_klaim' => $belumKlaim,
            ],
            'filters' => [
                'status' => $statusFilter,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created Pembimbing Lapangan and User account.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'no_telepon' => 'nullable|string|max:25',
            'instansi_id' => 'nullable|integer',
            'nama_instansi' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => trim($request->name),
                'email' => strtolower(trim($request->email)),
                'password' => Hash::make($request->password),
                'role' => 'instansi',
                'user_type' => 'instansi',
                'roles_assignment' => ['instansi'],
                'active_role' => 'instansi',
                'status_akun' => 'aktif',
                'no_telepon' => $request->no_telepon ? trim($request->no_telepon) : null,
                'must_change_password' => false,
                'has_set_password' => true,
            ]);

            $instansiId = $request->instansi_id;
            if (!$instansiId && $request->filled('nama_instansi')) {
                $instansi = Instansi::firstOrCreate(
                    ['nama' => trim($request->nama_instansi)],
                    ['alamat' => 'Alamat belum diatur']
                );
                $instansiId = $instansi->id;
            }

            if (!$instansiId) {
                $defaultInstansi = Instansi::firstOrCreate(
                    ['nama' => 'Instansi Mitra'],
                    ['alamat' => 'Alamat belum diatur']
                );
                $instansiId = $defaultInstansi->id;
            }

            PembimbingLapangan::create([
                'user_id' => $user->id,
                'instansi_id' => $instansiId,
                'nama' => $user->name,
            ]);
        });

        return back()->with('success', "Akun pembimbing lapangan '{$request->name}' berhasil ditambahkan.");
    }

    /**
     * Update the specified Pembimbing Lapangan and User account.
     */
    public function update(Request $request, $id): RedirectResponse
    {
        $pl = PembimbingLapangan::find($id);
        $user = $pl ? $pl->user : User::find($id);

        if (!$pl && !$user) {
            return back()->with('error', 'Data pembimbing lapangan tidak ditemukan.');
        }

        $userId = $user ? $user->id : null;

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'password' => 'nullable|string|min:6',
            'no_telepon' => 'nullable|string|max:25',
            'instansi_id' => 'nullable|integer',
            'nama_instansi' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($request, $pl, $user) {
            $instansiId = $request->instansi_id;
            if (!$instansiId && $request->filled('nama_instansi')) {
                $instansi = Instansi::firstOrCreate(
                    ['nama' => trim($request->nama_instansi)],
                    ['alamat' => 'Alamat belum diatur']
                );
                $instansiId = $instansi->id;
            }

            if ($user) {
                $userData = [
                    'name' => trim($request->name),
                    'email' => strtolower(trim($request->email)),
                    'no_telepon' => $request->no_telepon ? trim($request->no_telepon) : null,
                ];
                if ($request->filled('password')) {
                    $userData['password'] = Hash::make($request->password);
                }
                $user->update($userData);
            }

            if ($pl) {
                $plData = ['nama' => trim($request->name)];
                if ($instansiId) {
                    $plData['instansi_id'] = $instansiId;
                }
                $pl->update($plData);
            } elseif ($user) {
                // If PembimbingLapangan record didn't exist for this user, create it
                PembimbingLapangan::create([
                    'user_id' => $user->id,
                    'instansi_id' => $instansiId ?: Instansi::first()?->id,
                    'nama' => $user->name,
                ]);
            }
        });

        return back()->with('success', "Data pembimbing lapangan '{$request->name}' berhasil diperbarui.");
    }

    /**
     * Delete the specified Pembimbing Lapangan and User account.
     */
    public function destroy($id): RedirectResponse
    {
        $pl = PembimbingLapangan::find($id);
        $user = $pl ? $pl->user : User::find($id);

        if (!$pl && !$user) {
            return back()->with('error', 'Data pembimbing lapangan tidak ditemukan.');
        }

        $nama = $pl?->nama ?? $user?->name ?? 'Pembimbing Lapangan';

        DB::transaction(function () use ($pl, $user) {
            if ($pl) {
                Pendaftaran::where('pembimbing_lapangan_id', $pl->id)->update(['pembimbing_lapangan_id' => null]);
                $pl->delete();
            }

            if ($user && $user->role === 'instansi') {
                $user->delete();
            }
        });

        return back()->with('success', "Akun pembimbing lapangan '{$nama}' berhasil dihapus.");
    }

    /**
     * Activate a Pembimbing Lapangan user account.
     */
    public function activate(User $user): RedirectResponse
    {
        if ($user->role !== 'instansi') {
            return back()->with('error', 'Hanya akun pembimbing lapangan yang dapat diaktifkan melalui menu ini.');
        }

        $user->update(['status_akun' => 'aktif']);

        return back()->with('success', "Akun {$user->name} ({$user->email}) berhasil diaktifkan.");
    }

    /**
     * Deactivate a Pembimbing Lapangan user account.
     */
    public function deactivate(User $user): RedirectResponse
    {
        if ($user->role !== 'instansi') {
            return back()->with('error', 'Hanya akun pembimbing lapangan yang dapat dinonaktifkan.');
        }

        $user->update(['status_akun' => 'ditolak']);

        return back()->with('success', "Akun {$user->name} ({$user->email}) telah dinonaktifkan.");
    }

    /**
     * Reset password for Pembimbing Lapangan and send new credentials via email.
     */
    public function resetPassword(User $user, PembimbingLapanganService $service): RedirectResponse
    {
        if ($user->role !== 'instansi') {
            return back()->with('error', 'Hanya akun pembimbing lapangan yang dapat direset.');
        }

        $result = $service->resetPassword($user);

        if ($result['email_sent']) {
            return back()->with('success', "Kata sandi {$user->name} berhasil direset dan dikirimkan ke {$user->email}. Kata sandi baru: {$result['temp_password']}");
        }

        return back()->with('warning', "Kata sandi {$user->name} berhasil diperbarui menjadi '{$result['temp_password']}', namun email gagal terkirim ({$result['email_error']}). Silakan salin password ini dan serahkan ke pembimbing.");
    }

    /**
     * Resend credentials email to Pembimbing Lapangan.
     */
    public function resend(User $user, PembimbingLapanganService $service): RedirectResponse
    {
        return $this->resetPassword($user, $service);
    }

    /**
     * Preview credentials email HTML for Pembimbing Lapangan.
     */
    public function previewEmail(User $user)
    {
        if ($user->role !== 'instansi') {
            abort(404, 'User bukan pembimbing lapangan mitra.');
        }

        $pl = $user->pembimbingLapangan()->with('instansi')->first();
        $pendaftaran = \App\Models\Pendaftaran::where('pembimbing_lapangan_id', $pl?->id)
            ->with(['mahasiswa'])
            ->latest()
            ->first();

        $namaInstansi = $pl?->instansi?->nama ?? 'Instansi Mitra';
        $namaMahasiswa = $pendaftaran?->mahasiswa?->name ?? 'Mahasiswa Kerja Praktik';
        $nimMahasiswa = $pendaftaran?->mahasiswa?->nim ?? '-';
        $periodeKP = ($pendaftaran && $pendaftaran->tanggal_mulai && $pendaftaran->tanggal_selesai)
            ? $pendaftaran->tanggal_mulai->translatedFormat('d M Y') . ' s.d ' . $pendaftaran->tanggal_selesai->translatedFormat('d M Y')
            : null;

        return (new \App\Mail\KredensialPembimbingLapangan(
            nama: $user->name,
            email: $user->email,
            tempPassword: 'PasswordAcak123!',
            namaInstansi: $namaInstansi,
            namaMahasiswa: $namaMahasiswa,
            nimMahasiswa: $nimMahasiswa,
            periodeKP: $periodeKP,
            isReset: false
        ))->render();
    }
}
