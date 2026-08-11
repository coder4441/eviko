const fs = require('fs');

let content = fs.readFileSync('src/app/super-admin/page.tsx', 'utf8');

const imports = `import { TenantsManager } from "./components/TenantsManager";
import { PlatformUsersManager } from "./components/PlatformUsersManager";
import { BillingDashboard } from "./components/BillingDashboard";
import { SettingsManager } from "./components/SettingsManager";
`;

if (!content.includes('TenantsManager')) {
    content = content.replace(/import \{ LeadsTab \} from "\.\/LeadsTab";/, `import { LeadsTab } from "./LeadsTab";\n${imports}`);
}

// 1. Tenants Block
content = content.replace(
    /\{activeTab === "tenants" && \(\s*<div className="space-y-6">[\s\S]*?\{activeTab === "users" && \(/,
    `{activeTab === "tenants" && (
        <TenantsManager 
            canCreateTenants={canCreateTenants} 
            canEditTenants={canEditTenants} 
            canDeleteTenants={canDeleteTenants} 
            canImpersonateTenants={canImpersonateTenants}
            setShowAddModal={setShowAddModal}
            setEditingTenant={setEditingTenant}
        />
    )}

    {activeTab === "users" && (`
);

// 2. Users Block
content = content.replace(
    /\{activeTab === "users" && \(\s*<div className="space-y-6">[\s\S]*?\{activeTab === "billing" && \(/,
    `{activeTab === "users" && (
        <PlatformUsersManager 
            canCreateUsers={canCreateUsers} 
            canDeleteUsers={canDeleteUsers}
        />
    )}

    {activeTab === "billing" && (`
);

// 3. Billing Block
content = content.replace(
    /\{activeTab === "billing" && \(\s*<div className="space-y-6">[\s\S]*?\{activeTab === "tariffs" &&/,
    `{activeTab === "billing" && (
        <BillingDashboard 
            canViewBilling={canViewBilling}
            totalRevenue={stats?.totalRevenue || 0}
        />
    )}

    {activeTab === "tariffs" &&`
);

// 4. Settings Block (from settings tab to end of the file or closing tags)
content = content.replace(
    /\{activeTab === "settings" && \(\s*<div className="max-w-3xl space-y-6">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\);/,
    `{activeTab === "settings" && (
        <SettingsManager canManageSettings={canManageSettings} />
    )}
                </div>
            </div>
        </div>
    );`
);

fs.writeFileSync('src/app/super-admin/page.tsx', content, 'utf8');
console.log('Done refactoring page.tsx');
