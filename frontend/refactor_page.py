import re

with open("src/app/super-admin/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add imports at the top
imports = """import { TenantsManager } from "./components/TenantsManager";
import { PlatformUsersManager } from "./components/PlatformUsersManager";
import { BillingDashboard } from "./components/BillingDashboard";
import { SettingsManager } from "./components/SettingsManager";
"""
content = re.sub(r'import \{ LeadsTab \} from "\./LeadsTab";', f'import {{ LeadsTab }} from "./LeadsTab";\n{imports}', content)

# 2. Replace Tenants block
content = re.sub(
    r'\{\/\* \? TENANTS TAB \? \*\/\}\n\s*\{activeTab === "tenants" && \([\s\S]*?\)\}\n\s*\{\/\* \? USERS TAB \? \*\/\}',
    r'{/* \? TENANTS TAB \? */}\n                    {activeTab === "tenants" && (\n                        <TenantsManager \n                            canCreateTenants={canCreateTenants} \n                            canEditTenants={canEditTenants} \n                            canDeleteTenants={canDeleteTenants} \n                            canImpersonateTenants={canImpersonateTenants}\n                            setShowAddModal={setShowAddModal}\n                            setEditingTenant={setEditingTenant}\n                        />\n                    )}\n\n                    {/* \? USERS TAB \? */}',
    content
)

# 3. Replace Users block
content = re.sub(
    r'\{\/\* \? USERS TAB \? \*\/\}\n\s*\{activeTab === "users" && \([\s\S]*?\)\}\n\s*\{\/\* \? BILLING TAB \? \*\/\}',
    r'{/* \? USERS TAB \? */}\n                    {activeTab === "users" && (\n                        <PlatformUsersManager \n                            canCreateUsers={canCreateUsers} \n                            canDeleteUsers={canDeleteUsers}\n                        />\n                    )}\n\n                    {/* \? BILLING TAB \? */}',
    content
)

# 4. Replace Billing block
content = re.sub(
    r'\{\/\* \? BILLING TAB \? \*\/\}\n\s*\{activeTab === "billing" && \([\s\S]*?\)\}\n\s*\{\/\* \? TARIFFS TAB \? \*\/\}',
    r'{/* \? BILLING TAB \? */}\n                    {activeTab === "billing" && (\n                        <BillingDashboard \n                            canViewBilling={canViewBilling}\n                            totalRevenue={stats?.totalRevenue || 0}\n                        />\n                    )}\n\n                    {/* \? TARIFFS TAB \? */}',
    content
)

# 5. Replace Settings block
content = re.sub(
    r'\{\/\* \? SETTINGS TAB \? \*\/\}\n\s*\{activeTab === "settings" && \([\s\S]*?\)\}\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\);',
    r'{/* \? SETTINGS TAB \? */}\n                    {activeTab === "settings" && (\n                        <SettingsManager canManageSettings={canManageSettings} />\n                    )}\n                </div>\n            </div>\n        </div>\n    );\n',
    content
)

with open("src/app/super-admin/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Done refactoring page.tsx")
