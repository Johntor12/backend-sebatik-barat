-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'visitor') NULL DEFAULT 'visitor',

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `adminId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `desa` ENUM('binalawan', 'liangbunyu', 'setabu', 'enreukan') NOT NULL,

    UNIQUE INDEX `Admin_userId_key`(`userId`),
    PRIMARY KEY (`adminId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Berita` (
    `beritaId` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `isi` VARCHAR(191) NOT NULL,
    `gambarUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` INTEGER NOT NULL,
    `desa` ENUM('binalawan', 'liangbunyu', 'setabu', 'enreukan') NOT NULL,
    `adminAdminId` INTEGER NULL,

    PRIMARY KEY (`beritaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Galeri` (
    `galeriId` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `gambarUrl` VARCHAR(191) NOT NULL,
    `desa` ENUM('binalawan', 'liangbunyu', 'setabu', 'enreukan') NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`galeriId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Peraturan` (
    `peraturanId` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `desa` ENUM('binalawan', 'liangbunyu', 'setabu', 'enreukan') NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`peraturanId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Admin` ADD CONSTRAINT `Admin_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Berita` ADD CONSTRAINT `Berita_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Berita` ADD CONSTRAINT `Berita_adminAdminId_fkey` FOREIGN KEY (`adminAdminId`) REFERENCES `Admin`(`adminId`) ON DELETE SET NULL ON UPDATE CASCADE;
