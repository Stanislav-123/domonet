-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `login` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('owner', 'manager', 'affiliate', 'pending') NOT NULL DEFAULT 'affiliate',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_login_key`(`login`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Campaign` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `affiliateId` VARCHAR(191) NULL,
    `prelandUrl` VARCHAR(191) NULL,
    `exitPopup` BOOLEAN NOT NULL DEFAULT true,
    `timedPopup` BOOLEAN NOT NULL DEFAULT false,
    `timedPopupSec` INTEGER NOT NULL DEFAULT 15,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Integration` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` MEDIUMTEXT NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CampaignIntegration` (
    `campaignId` VARCHAR(191) NOT NULL,
    `integrationId` VARCHAR(191) NOT NULL,
    `weight` INTEGER NOT NULL DEFAULT 100,

    PRIMARY KEY (`campaignId`, `integrationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lander` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('price_guess', 'price_candles', 'ai_agents', 'profit_calc', 'quiz', 'live_signals', 'copy_desk', 'airdrop', 'vault', 'briefing', 'bonus_wheel') NOT NULL,
    `weight` INTEGER NOT NULL DEFAULT 100,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `dailyCap` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Lander_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CampaignLander` (
    `campaignId` VARCHAR(191) NOT NULL,
    `landerId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`campaignId`, `landerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrackingLink` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `landerId` VARCHAR(191) NULL,
    `affiliateId` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TrackingLink_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Click` (
    `id` VARCHAR(191) NOT NULL,
    `clickId` VARCHAR(191) NOT NULL,
    `trackingLinkId` VARCHAR(191) NULL,
    `campaignId` VARCHAR(191) NULL,
    `landerId` VARCHAR(191) NULL,
    `affiliateId` VARCHAR(191) NULL,
    `ip` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NULL,
    `device` VARCHAR(191) NULL,
    `os` VARCHAR(191) NULL,
    `browser` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `referer` TEXT NULL,
    `source` VARCHAR(191) NULL,
    `sub1` VARCHAR(191) NULL,
    `sub2` VARCHAR(191) NULL,
    `sub3` VARCHAR(191) NULL,
    `sub4` VARCHAR(191) NULL,
    `sub5` VARCHAR(191) NULL,
    `isBot` BOOLEAN NOT NULL DEFAULT false,
    `isUnique` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Click_clickId_key`(`clickId`),
    INDEX `Click_createdAt_idx`(`createdAt`),
    INDEX `Click_affiliateId_createdAt_idx`(`affiliateId`, `createdAt`),
    INDEX `Click_landerId_createdAt_idx`(`landerId`, `createdAt`),
    INDEX `Click_campaignId_createdAt_idx`(`campaignId`, `createdAt`),
    INDEX `Click_country_idx`(`country`),
    INDEX `Click_isBot_idx`(`isBot`),
    INDEX `Click_ip_createdAt_idx`(`ip`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('back_button', 'exit_shown', 'exit_closed', 'exit_clicked', 'land_view', 'form_start', 'form_submit') NOT NULL,
    `clickId` VARCHAR(191) NOT NULL,
    `landerId` VARCHAR(191) NULL,
    `campaignId` VARCHAR(191) NULL,
    `affiliateId` VARCHAR(191) NULL,
    `isBot` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Event_type_createdAt_idx`(`type`, `createdAt`),
    INDEX `Event_affiliateId_createdAt_idx`(`affiliateId`, `createdAt`),
    INDEX `Event_landerId_createdAt_idx`(`landerId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lead` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL DEFAULT '',
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NULL,
    `status` ENUM('new', 'lead', 'sale', 'confirmed', 'rejected', 'duplicate') NOT NULL DEFAULT 'new',
    `payout` DOUBLE NULL DEFAULT 0,
    `clickId` VARCHAR(191) NULL,
    `landerId` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NULL,
    `affiliateId` VARCHAR(191) NULL,
    `integrationId` VARCHAR(191) NULL,
    `ip` VARCHAR(191) NULL,
    `device` VARCHAR(191) NULL,
    `partnerSentAt` DATETIME(3) NULL,
    `partnerStatus` VARCHAR(191) NULL,
    `partnerResponse` TEXT NULL,
    `externalId` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Lead_createdAt_idx`(`createdAt`),
    INDEX `Lead_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `Lead_email_createdAt_idx`(`email`, `createdAt`),
    INDEX `Lead_phone_createdAt_idx`(`phone`, `createdAt`),
    INDEX `Lead_landerId_createdAt_idx`(`landerId`, `createdAt`),
    INDEX `Lead_affiliateId_createdAt_idx`(`affiliateId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_affiliateId_fkey` FOREIGN KEY (`affiliateId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignIntegration` ADD CONSTRAINT `CampaignIntegration_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignIntegration` ADD CONSTRAINT `CampaignIntegration_integrationId_fkey` FOREIGN KEY (`integrationId`) REFERENCES `Integration`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignLander` ADD CONSTRAINT `CampaignLander_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignLander` ADD CONSTRAINT `CampaignLander_landerId_fkey` FOREIGN KEY (`landerId`) REFERENCES `Lander`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrackingLink` ADD CONSTRAINT `TrackingLink_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrackingLink` ADD CONSTRAINT `TrackingLink_landerId_fkey` FOREIGN KEY (`landerId`) REFERENCES `Lander`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrackingLink` ADD CONSTRAINT `TrackingLink_affiliateId_fkey` FOREIGN KEY (`affiliateId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Click` ADD CONSTRAINT `Click_trackingLinkId_fkey` FOREIGN KEY (`trackingLinkId`) REFERENCES `TrackingLink`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Click` ADD CONSTRAINT `Click_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Click` ADD CONSTRAINT `Click_landerId_fkey` FOREIGN KEY (`landerId`) REFERENCES `Lander`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Click` ADD CONSTRAINT `Click_affiliateId_fkey` FOREIGN KEY (`affiliateId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_clickId_fkey` FOREIGN KEY (`clickId`) REFERENCES `Click`(`clickId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_landerId_fkey` FOREIGN KEY (`landerId`) REFERENCES `Lander`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_clickId_fkey` FOREIGN KEY (`clickId`) REFERENCES `Click`(`clickId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_landerId_fkey` FOREIGN KEY (`landerId`) REFERENCES `Lander`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_affiliateId_fkey` FOREIGN KEY (`affiliateId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
