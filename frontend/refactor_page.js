const fs = require('fs');

let content = fs.readFileSync('src/app/super-admin/page.tsx', 'utf8');

const imports = `import { TenantsManager } from "./components/TenantsManager";
import { PlatformUsersManager } from "./components/PlatformUsersManager";
import { BillingDashboard } from "./components/BillingDashboard";
import { SettingsManager } from "./components/SettingsManager";
`;

content = content.replace(/import \{ LeadsTab \} from "\.\/LeadsTab";/, `import { LeadsTab } from "./LeadsTab";\n${imports}`);

content = content.replace(
    /\{\/\* \? TENANTS TAB \? \*\/\}\n\s*\{activeTab === "tenants" && \([\s\S]*?\)\}\n\s*\{\/\* \? USERS TAB \? \*\/\}/,
    `{/* ? TENANTS TAB ? */}\n                    {activeTab === "tenants" && (\n                        <TenantsManager \n                            canCreateTenants={canCreateTenants} \n                            canEditTenants={canEditTenants} \n                            canDeleteTenants={canDeleteTenants} \n                            canImpersonateTenants={canImpersonateTenants}\n                            setShowAddModal={setShowAddModal}\n                            setEditingTenant={setEditingTenant}\n                        />\n                    )}\n\n                    {/* ? USERS TAB ? */}`
);

content = content.replace(
    /\{\/\* \? USERS TAB \? \*\/\}\n\s*\{activeTab === "users" && \([\s\S]*?\)\}\n\s*\{\/\* \? BILLING TAB \? \*\/\}/,
    `{/* ? USERS TAB ? */}\n                    {activeTab === "users" && (\n                        <PlatformUsersManager \n                            canCreateUsers={canCreateUsers} \n                            canDeleteUsers={canDeleteUsers}\n                        />\n                    )}\n\n                    {/* ? BILLING TAB ? */}`
);

content = content.replace(
    /\{\/\* \? BILLING TAB \? \*\/\}\n\s*\{activeTab === "billing" && \([\s\S]*?\)\}\n\s*\{\/\* \? TARIFFS TAB \? \*\/\}/,
    `{/* ? BILLING TAB ? */}\n                    {activeTab === "billing" && (\n                        <BillingDashboard \n                            canViewBilling={canViewBilling}\n                            totalRevenue={stats?.totalRevenue || 0}\n                        />\n                    )}\n\n                    {/* ? TARIFFS TAB ? */}`
);

content = content.replace(
    /\{\/\* \? SETTINGS TAB \? \*\/\}\n\s*\{activeTab === "settings" && \([\s\S]*?\)\}\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\);/,
    `{/* ? SETTINGS TAB ? */}\n                    {activeTab === "settings" && (\n                        <SettingsManager canManageSettings={canManageSettings} />\n                    )}\n                </div>\n            </div>\n        </div>\n    );\n`
);

fs.writeFileSync('src/app/super-admin/page.tsx', content, 'utf8');
console.log('Done refactoring page.tsx');
