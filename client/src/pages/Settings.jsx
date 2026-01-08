
import { Sidebar } from "../components/Sidebar";
import { DashboardHeader } from "../components/DashboardHeader";
import SettingsContent from "../components/SettingsContent";



const Settings = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 ml-64">
        <DashboardHeader title="Settings" />
        <SettingsContent />
      </main>
    </div>
  );
};

export default Settings;