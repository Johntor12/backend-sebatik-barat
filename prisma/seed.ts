import {
  Role,
  NamaDesa,
  Admin,
  Berita,
  Galeri,
  Peraturan,
  User,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

import prisma from "../api/prisma/client";

async function SeedUser(username: string, email: string, password: string, role: Role): Promise<User | null> {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUser = await prisma.user.create({
            data: { username, email, password: hashedPassword, role }
        });
        console.log(`User created: ${createdUser.username}`);
        return createdUser;
    } catch (error) {
        console.error(`Error creating user ${username}:`, error);
        return null;
    }
}

async function SeedAdmin(userId: number, username: string, status: string, desa: NamaDesa): Promise<Admin | null> {
    try {
        const createdAdmin = await prisma.admin.create({
            data: {
                userId,
                username,
                status,
                desa
            }
        });
        console.log(`Admin created: ${createdAdmin.username} for ${createdAdmin.desa}`);
        return createdAdmin;
    } catch (error) {
        console.error(`❌ Error creating admin ${username}:`, error);
        return null;
    }
}

async function SeedBerita(
    judul: string, 
    isi: string, 
    gambarUrl: string | null, 
    authorId: number, 
    desa: NamaDesa,
    adminAdminId?: number
): Promise<Berita | null> {
    try {
        const createdBerita = await prisma.berita.create({
            data: {
                judul,
                isi,
                gambarUrl,
                authorId,
                desa,
                adminAdminId
            }
        });
        console.log(`Berita created: ${createdBerita.judul}`);
        return createdBerita;
    } catch (error) {
        console.error(`Error creating berita ${judul}:`, error);
        return null;
    }
}

async function SeedGaleri(judul: string, gambarUrl: string, desa: NamaDesa): Promise<Galeri | null> {
    try {
        const createdGaleri = await prisma.galeri.create({
            data: {
                judul,
                gambarUrl,
                desa
            }
        });
        console.log(`Galeri created: ${createdGaleri.judul}`);
        return createdGaleri;
    } catch (error) {
        console.error(`Error creating galeri ${judul}:`, error);
        return null;
    }
}

async function SeedPeraturan(judul: string, fileUrl: string, desa: NamaDesa): Promise<Peraturan | null> {
    try {
        const createdPeraturan = await prisma.peraturan.create({
            data: {
                judul,
                fileUrl,
                desa
            }
        });
        console.log(`Peraturan created: ${createdPeraturan.judul}`);
        return createdPeraturan;
    } catch (error) {
        console.error(`Error creating peraturan ${judul}:`, error);
        return null;
    }
}

async function runSeeders() {
    try {
        console.log("Starting database seeding...");

        console.log("Seeding Users...");
        const user1 = await SeedUser("admin_binalawan", "admin.binalawan@email.com", "password123", Role.admin);
        const user2 = await SeedUser("admin_liangbunyu", "admin.liangbunyu@email.com", "password123", Role.admin);
        const user3 = await SeedUser("admin_setabu", "admin.setabu@email.com", "password123", Role.admin);
        const user4 = await SeedUser("admin_enreukan", "admin.enreukan@email.com", "password123", Role.admin);
        const user5 = await SeedUser("visitor1", "visitor1@email.com", "password123", Role.visitor);
        const user6 = await SeedUser("visitor2", "visitor2@email.com", "password123", Role.visitor);

        console.log("Seeding Admins...");
        let admin1, admin2, admin3, admin4;
        if (user1) admin1 = await SeedAdmin(user1.id, user1.username, "active", NamaDesa.binalawan);
        if (user2) admin2 = await SeedAdmin(user2.id, user2.username, "active", NamaDesa.liangbunyu);
        if (user3) admin3 = await SeedAdmin(user3.id, user3.username, "active", NamaDesa.setabu);
        if (user4) admin4 = await SeedAdmin(user4.id, user4.username, "active", NamaDesa.enreukan);

        console.log("Seeding Berita...");
        if (user1) {
            await SeedBerita(
                "Pembangunan Jalan Desa Binalawan",
                "Desa Binalawan sedang melakukan pembangunan jalan utama untuk meningkatkan aksesibilitas warga. Proyek ini diperkirakan akan selesai dalam 3 bulan ke depan.",
                "https://example.com/images/jalan-binalawan.jpg",
                user1.id,
                NamaDesa.binalawan,
                admin1?.adminId
            );
        }

        if (user2) {
            await SeedBerita(
                "Festival Budaya Liangbunyu 2024",
                "Desa Liangbunyu akan mengadakan festival budaya tahunan pada bulan depan. Acara ini akan menampilkan tarian tradisional dan kuliner khas daerah.",
                "https://example.com/images/festival-liangbunyu.jpg",
                user2.id,
                NamaDesa.liangbunyu,
                admin2?.adminId
            );
        }

        if (user3) {
            await SeedBerita(
                "Program Bantuan Sosial Desa Setabu",
                "Pemerintah desa Setabu meluncurkan program bantuan sosial untuk keluarga kurang mampu. Program ini mencakup bantuan sembako dan beasiswa pendidikan.",
                null,
                user3.id,
                NamaDesa.setabu,
                admin3?.adminId
            );
        }

        if (user4) {
            await SeedBerita(
                "Gotong Royong Pembersihan Lingkungan Enreukan",
                "Warga desa Enreukan bersatu dalam kegiatan gotong royong membersihkan lingkungan desa. Kegiatan ini dilakukan setiap minggu untuk menjaga kebersihan.",
                "https://example.com/images/gotong-royong-enreukan.jpg",
                user4.id,
                NamaDesa.enreukan,
                admin4?.adminId
            );
        }

        console.log("Seeding Galeri...");
        await SeedGaleri("Pemandangan Sawah Binalawan", "https://example.com/gallery/sawah-binalawan.jpg", NamaDesa.binalawan);
        await SeedGaleri("Pantai Liangbunyu", "https://example.com/gallery/pantai-liangbunyu.jpg", NamaDesa.liangbunyu);
        await SeedGaleri("Upacara Adat Setabu", "https://example.com/gallery/upacara-setabu.jpg", NamaDesa.setabu);
        await SeedGaleri("Pasar Tradisional Enreukan", "https://example.com/gallery/pasar-enreukan.jpg", NamaDesa.enreukan);
        await SeedGaleri("Masjid Desa Binalawan", "https://example.com/gallery/masjid-binalawan.jpg", NamaDesa.binalawan);
        await SeedGaleri("Sekolah Dasar Liangbunyu", "https://example.com/gallery/sd-liangbunyu.jpg", NamaDesa.liangbunyu);

        console.log("Seeding Peraturan...");
        await SeedPeraturan("Peraturan Desa No. 1/2024 tentang Tata Tertib Desa", "https://example.com/docs/perdes-01-2024-binalawan.pdf", NamaDesa.binalawan);
        await SeedPeraturan("Peraturan Desa No. 2/2024 tentang APBDes", "https://example.com/docs/perdes-02-2024-liangbunyu.pdf", NamaDesa.liangbunyu);
        await SeedPeraturan("Peraturan Desa No. 1/2024 tentang Retribusi Pasar", "https://example.com/docs/perdes-01-2024-setabu.pdf", NamaDesa.setabu);
        await SeedPeraturan("Peraturan Desa No. 3/2024 tentang Pengelolaan Sampah", "https://example.com/docs/perdes-03-2024-enreukan.pdf", NamaDesa.enreukan);
        await SeedPeraturan("Peraturan Desa No. 4/2024 tentang Keamanan Desa", "https://example.com/docs/perdes-04-2024-binalawan.pdf", NamaDesa.binalawan);

        console.log("Database seeding completed successfully!");

    } catch (error) {
        console.error("Error during seeding:", error);
    } finally {
        await prisma.$disconnect();
    }
}

async function clearDatabase() {
    try {
        console.log("Clear Database");
        
        await prisma.berita.deleteMany();
        await prisma.admin.deleteMany();
        await prisma.galeri.deleteMany();
        await prisma.peraturan.deleteMany();
        await prisma.user.deleteMany();
        
        console.log("Database cleared successfully!");
    } catch (error) {
        console.error("Error clearing database:", error);
    }
}

export {
    SeedUser,
    SeedAdmin,
    SeedBerita,
    SeedGaleri,
    SeedPeraturan,
    runSeeders,
    clearDatabase
};