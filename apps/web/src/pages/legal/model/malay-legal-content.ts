import type { LegalDocument } from "./legal-content";

const googleLinks = [
  {
    label: "Cara Google menggunakan data daripada laman rakan kongsi",
    href: "https://policies.google.com/technologies/partner-sites",
  },
  {
    label: "Dasar Privasi Google",
    href: "https://policies.google.com/privacy",
  },
  {
    label: "Terma Pemprosesan Data Google Ads",
    href: "https://business.safety.google/adsprocessorterms/",
  },
];

export const malayLegalDocuments = {
  privacy: {
    eyebrow: "UNDANG-UNDANG",
    title: "Dasar Privasi",
    summary:
      "Dasar ini menerangkan cara GatherWheel memproses data peribadi, termasuk data Google Analytics pilihan.",
    effectiveDateLabel: "Tarikh berkuat kuasa",
    controllerTitle: "1. Pengawal data dan maklumat hubungan",
    contactLabel: "Hubungan privasi",
    controllerFallback:
      "Pengendali perkhidmatan ialah pengawal data. Pengendali perkhidmatan sebenar mesti menerbitkan nama sah dan maklumat hubungan privasinya di sini sebelum pelancaran.",
    sections: [
      {
        title: "2. Data yang kami proses",
        items: [
          "Data bilik yang anda berikan: nama paparan, tajuk bilik, pilihan roda, cadangan, kata laluan pilihan, kebenaran, cap masa dan keputusan putaran bersama. Kata laluan hanya disimpan sebagai cincangan Argon2 sehala.",
          "Data sesi dan keselamatan: token sesi bilik rawak (hanya cincangannya disimpan dalam pangkalan data), rekod IP sementara dalam memori untuk mengehadkan percubaan menyertai yang gagal, serta log HTTP operasi yang mungkin dicipta oleh penyedia pengehosan.",
          "Data pada peranti: bahasa, pintasan bilik tersimpan, templat roda dan rekod persetujuan analitik anda.",
          "Google Fonts menerima alamat IP dan metadata HTTP biasa apabila pelayar anda meminta fon antara muka.",
        ],
      },
      {
        title: "3. Google Analytics pilihan",
        items: [
          "Google Analytics 4 tidak dimuatkan dan tidak menerima sebarang permintaan analitik sehingga anda secara aktif membenarkan analitik. Menolak analitik tidak mengehadkan perkhidmatan.",
          "Selepas persetujuan diberikan, kami menghantar paparan halaman yang diseragamkan dan peristiwa produk room_create, room_join_start, room_join, room_join_failed, spin_start, share_room, share_room_failed, preset_select, template_select, template_save, elimination_enable dan round_reset. Peristiwa penyertaan mungkin mengandungi parameter kategori tetap entry_type, has_password dan reason; peristiwa perkongsian mungkin mengandungi role dan method. Parameter ini tidak mengandungi kandungan yang diberikan oleh pengguna. URL bilik digantikan dengan /r/:room; rentetan pertanyaan, kod bilik, nama, kata laluan dan kandungan roda tidak dihantar.",
          "Google mungkin memproses maklumat peranti/pelayar, lokasi anggaran yang diperoleh daripada sambungan, alamat IP semasa penghantaran, maklumat perujuk, cap masa dan pengecam analitik pihak pertama yang disimpan dalam kuki _ga.",
          "Storan pengiklanan, data pengguna iklan, pemperibadian iklan, Google Signals, User-ID dan pengiklanan diperibadikan dilumpuhkan dalam konfigurasi tag kami.",
        ],
      },
      {
        title: "4. Tujuan dan asas undang-undang",
        items: [
          "Menyediakan, menyegerakkan dan mentadbir bilik yang anda minta — pelaksanaan kontrak atau langkah sebelum kontrak (Perkara 6(1)(b) GDPR).",
          "Mencegah penyalahgunaan, memastikan perkhidmatan boleh dipercayai dan menyediakan antara muka yang konsisten termasuk fon — kepentingan sah kami (Perkara 6(1)(f)), yang diimbangi dengan hak pengguna.",
          "Mengukur jumlah lawatan dan penggunaan ciri untuk menambah baik GatherWheel — persetujuan anda (Perkara 6(1)(a) dan, jika berkenaan, peraturan ePrivacy). Anda boleh menarik balik persetujuan pada bila-bila masa.",
        ],
      },
      {
        title: "5. Penerima dan pemindahan antarabangsa",
        items: [
          "Orang dalam bilik yang sama melihat nama paparan, kandungan bilik dan keputusan bersama. Cadangan dipaparkan tanpa nama pencadang, tetapi rekod pada pelayan kekal dikaitkan dengan peserta tersebut.",
          "Railway memproses data aplikasi, pangkalan data dan operasi sebagai penyedia pengehosan mengikut konfigurasi akaun perkhidmatan sebenar.",
          "Google menerima permintaan fon dan, hanya selepas persetujuan analitik, data GA4 sebagai penyedia analitik kami. Entiti Google yang menjadi pihak kontrak dan subpemproses yang berkenaan mungkin memproses data di luar Kawasan Ekonomi Eropah (EEA).",
          "Apabila data meninggalkan EEA, perlindungan mungkin merangkumi keputusan kecukupan, Rangka Kerja Privasi Data EU–AS jika berkenaan, dan Klausa Kontrak Standard Suruhanjaya Eropah. Anda boleh meminta maklumat tentang perlindungan yang berkaitan daripada kami.",
        ],
        links: googleLinks,
      },
      {
        title: "6. Tempoh penyimpanan",
        items: [
          "Bilik dan rekod pangkalan data yang berkaitan tamat tempoh selepas tujuh hari tanpa aktiviti dan dipadam melalui pembersihan setiap jam; hos boleh memadam bilik lebih awal. Kuki sesi bilik tamat tempoh selepas tujuh hari.",
          "Rekod percubaan menyertai yang gagal hanya kekal dalam memori pelayan. Log pengehosan dan sandaran mengikut tempoh penyimpanan yang dikonfigurasi oleh penyedia perkhidmatan sebenar.",
          "Pintasan bilik tersimpan, bahasa dan templat kekal pada peranti sehingga dipadam. Rekod persetujuan tamat tempoh selepas 180 hari, dan kami akan meminta persetujuan semula selepas itu.",
          "Kuki analitik dikonfigurasi untuk tempoh tidak melebihi 180 hari dan tarikh luputnya tidak dilanjutkan pada lawatan berikutnya. Menarik balik persetujuan meminta pelayar memadam kuki _ga milik GatherWheel.",
          "Data peringkat pengguna dan peristiwa GA4 dirancang untuk disimpan selama dua bulan. Google mungkin menyimpan laporan agregat atau data yang perlu disimpan atas sebab keselamatan atau undang-undang untuk tempoh lebih lama mengikut termanya.",
        ],
      },
      {
        title: "7. Pilihan dan hak anda",
        paragraphs: [
          "Gunakan “Tetapan kuki” pada mana-mana halaman untuk menolak, membenarkan atau menarik balik persetujuan analitik semudah anda memberikannya. Penarikan balik tidak menjejaskan pemprosesan yang berlaku sebelumnya.",
          "Mengikut pemakaian GDPR, anda boleh meminta akses, pembetulan, pemadaman, sekatan atau pemindahan data; membantah pemprosesan berdasarkan kepentingan sah; dan menarik balik persetujuan. Hubungi kami melalui maklumat di atas. Anda boleh membuat aduan kepada pihak berkuasa penyeliaan di tempat anda tinggal, bekerja atau percaya bahawa pelanggaran telah berlaku.",
          "Tetapan Bilik membolehkan peserta semasa memuat turun atau memadam data yang dikaitkan dengan identiti bilik tersebut; hos boleh memadam bilik. Untuk permintaan analitik, hubungi kami kerana eksport aplikasi tidak mengandungi data Google Analytics.",
        ],
      },
      {
        title: "8. Data yang diperlukan, keselamatan dan keputusan automatik",
        paragraphs: [
          "Nama paparan dan kandungan bilik yang diperlukan untuk ciri yang dipilih adalah wajib bagi menyediakan ciri tersebut; kata laluan, pintasan tersimpan, templat dan persetujuan analitik adalah pilihan. Kami menggunakan token akses, pencincangan, had kadar, kuki dengan akses terhad dan storan bertempoh, tetapi tiada perkhidmatan dalam talian yang bebas risiko.",
          "GatherWheel tidak membuat keputusan yang menghasilkan kesan undang-undang atau kesan penting yang seumpamanya. Keputusan rawak hanya terhasil apabila peserta yang diberi kebenaran memulakan putaran. Kami tidak menjual data peribadi atau menggunakannya untuk pengiklanan atau pemprofilan.",
        ],
      },
      {
        title: "9. Perubahan",
        paragraphs: [
          "Kami akan mengemas kini notis ini dan tarikh berkuat kuasanya apabila terdapat perubahan penting pada pemprosesan, serta meminta persetujuan baharu jika diperlukan.",
        ],
      },
    ],
  },
  cookies: {
    eyebrow: "UNDANG-UNDANG",
    title: "Dasar Kuki",
    summary:
      "Dasar ini menyenaraikan kuki dan storan pelayar GatherWheel, termasuk Google Analytics pilihan.",
    effectiveDateLabel: "Tarikh berkuat kuasa",
    controllerTitle: "1. Pihak yang mengendalikan storan ini",
    contactLabel: "Hubungan privasi",
    controllerFallback:
      "Pengendali perkhidmatan sebenar mesti menerbitkan nama sah dan maklumat hubungan privasinya di sini sebelum pelancaran.",
    sections: [
      {
        title: "2. Kuki yang diperlukan dan storan setempat",
        items: [
          "gatherwheel_session_<room-code> — token akses bilik selamat dengan HttpOnly; sangat diperlukan; tamat tempoh selepas tujuh hari.",
          "gatherwheel-locale — pilihan bahasa; localStorage; kekal sehingga diubah atau dipadam.",
          "gatherwheel-rooms dan kunci lama gatherwheel-host-rooms — pintasan bilik yang disimpan atas permintaan anda; localStorage; sehingga dipadam atau bilik tamat tempoh.",
          "gatherwheel-templates — templat roda yang disimpan pada peranti ini; localStorage; sehingga dipadam.",
          "gatherwheel-consent-v1 — pilihan analitik, masa keputusan dan tarikh luput; localStorage yang sangat diperlukan; 180 hari.",
        ],
      },
      {
        title: "3. Kuki analitik pilihan",
        items: [
          "_ga — membezakan pelayar untuk GA4; kuki pihak pertama; tidak melebihi 180 hari.",
          "_ga_<container-id> — mengekalkan keadaan sesi GA4; kuki pihak pertama; tidak melebihi 180 hari.",
          "Tarikh luput dikonfigurasi supaya tidak dilanjutkan pada lawatan semula. Google Analytics tidak dimuatkan dan kuki ini tidak ditetapkan sebelum persetujuan diberikan.",
        ],
      },
      {
        title: "4. Persetujuan dan pemadaman",
        paragraphs: [
          "Sepanduk pertama menyediakan tindakan Benarkan dan Tolak yang sama mudah dicapai. “Urus pilihan” menyediakan suis analitik yang berasingan. Pilihan anda tidak menyekat akses.",
          "Gunakan butang “Tetapan kuki” yang sentiasa tersedia untuk mengubah atau menarik balik persetujuan. Apabila persetujuan ditarik balik, analitik dilumpuhkan dan GatherWheel cuba memadam kuki _ga miliknya. Kawalan pelayar juga boleh memadam kuki dan localStorage, tetapi memadam storan yang diperlukan mungkin melog anda keluar daripada bilik atau memadam pilihan tersimpan.",
        ],
      },
      {
        title: "5. Permintaan pihak ketiga",
        paragraphs: [
          "Permintaan Google Analytics hanya berlaku selepas persetujuan diberikan. Permintaan Google Fonts kini diperlukan untuk fon antara muka dan boleh mendedahkan alamat IP serta metadata permintaan anda kepada Google walaupun analitik ditolak; permintaan ini bukan sebahagian daripada persetujuan GA.",
        ],
        links: googleLinks,
      },
    ],
  },
} satisfies { privacy: LegalDocument; cookies: LegalDocument };
