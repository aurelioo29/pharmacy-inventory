import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const permissions = [
  // Dashboard
  ["Dashboard View", "dashboard.view", "dashboard", "view"],

  // Users
  ["Users View", "users.view", "users", "view"],
  ["Users Create", "users.create", "users", "create"],
  ["Users Update", "users.update", "users", "update"],
  ["Users Delete", "users.delete", "users", "delete"],

  // Roles
  ["Roles View", "roles.view", "roles", "view"],
  ["Roles Create", "roles.create", "roles", "create"],
  ["Roles Update", "roles.update", "roles", "update"],
  ["Roles Delete", "roles.delete", "roles", "delete"],
  [
    "Roles Assign Permissions",
    "roles.assign_permissions",
    "roles",
    "assign_permissions",
  ],

  // Permissions
  ["Permissions View", "permissions.view", "permissions", "view"],

  // Categories
  ["Categories View", "categories.view", "categories", "view"],
  ["Categories Create", "categories.create", "categories", "create"],
  ["Categories Update", "categories.update", "categories", "update"],
  ["Categories Delete", "categories.delete", "categories", "delete"],

  // Units
  ["Units View", "units.view", "units", "view"],
  ["Units Create", "units.create", "units", "create"],
  ["Units Update", "units.update", "units", "update"],
  ["Units Delete", "units.delete", "units", "delete"],

  // Medicines
  ["Medicines View", "medicines.view", "medicines", "view"],
  ["Medicines Create", "medicines.create", "medicines", "create"],
  ["Medicines Update", "medicines.update", "medicines", "update"],
  ["Medicines Delete", "medicines.delete", "medicines", "delete"],

  // Suppliers
  ["Suppliers View", "suppliers.view", "suppliers", "view"],
  ["Suppliers Create", "suppliers.create", "suppliers", "create"],
  ["Suppliers Update", "suppliers.update", "suppliers", "update"],
  ["Suppliers Delete", "suppliers.delete", "suppliers", "delete"],

  // Purchases
  ["Purchases View", "purchases.view", "purchases", "view"],
  ["Purchases Create", "purchases.create", "purchases", "create"],
  ["Purchases Detail", "purchases.detail", "purchases", "detail"],
  ["Purchases Delete", "purchases.delete", "purchases", "delete"],

  // Sales
  ["Sales View", "sales.view", "sales", "view"],
  ["Sales Create", "sales.create", "sales", "create"],
  ["Sales Detail", "sales.detail", "sales", "detail"],
  ["Sales Delete", "sales.delete", "sales", "delete"],

  // Stock
  ["Stock View", "stock.view", "stock", "view"],
  ["Stock Movement", "stock.movement", "stock", "movement"],
  ["Stock Adjustment", "stock.adjustment", "stock", "adjustment"],

  // Expired medicines
  [
    "Expired Medicines View",
    "expired_medicines.view",
    "expired_medicines",
    "view",
  ],

  // Reports
  ["Reports View", "reports.view", "reports", "view"],

  // Settings
  ["Settings View", "settings.view", "settings", "view"],
  ["Settings Update", "settings.update", "settings", "update"],

  // Activity Logs
  ["Activity Logs View", "activity_logs.view", "activity_logs", "view"],
] as const;

async function main() {
  console.log("Seeding started...");

  const superAdminRole = await prisma.role.upsert({
    where: { slug: "super-admin" },
    update: {},
    create: {
      name: "Super Admin",
      slug: "super-admin",
      description: "Full access to all system features",
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { slug: "admin" },
    update: {},
    create: {
      name: "Admin",
      slug: "admin",
      description: "Admin pharmacy access",
    },
  });

  for (const [name, slug, module, action] of permissions) {
    await prisma.permission.upsert({
      where: { slug },
      update: {
        name,
        module,
        action,
      },
      create: {
        name,
        slug,
        module,
        action,
      },
    });
  }

  const allPermissions = await prisma.permission.findMany();

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@pharmacy.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@pharmacy.com",
      passwordHash,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: superAdminRole.id,
    },
  });

  await prisma.setting.upsert({
    where: { key: "expired_alert_days" },
    update: {},
    create: {
      key: "expired_alert_days",
      value: "30",
      type: "number",
      description: "Number of days before medicine expiry to show alert",
    },
  });

  await prisma.setting.upsert({
    where: { key: "app_name" },
    update: {},
    create: {
      key: "app_name",
      value: "Pharmacy Inventory",
      type: "string",
      description: "Application name",
    },
  });

  console.log("Seeding completed.");
  console.log("Default login:");
  console.log("Email: admin@pharmacy.com");
  console.log("Password: password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
