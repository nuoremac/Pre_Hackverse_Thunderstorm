import { User, Bell, Shield, Calendar, Zap, CreditCard, ExternalLink, Mail, Lock } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8 md:p-10 max-w-[1000px] mx-auto h-full flex flex-col font-sans">
      
      <div className="space-y-10 pb-20">
        
        {/* Section: Profile */}
        <section className="bg-white rounded-2xl border border-[var(--line)] shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-[var(--line)] flex items-center gap-2">
            <User className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="text-sm font-bold text-[var(--ink)] uppercase tracking-wider">Profile Information</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 shadow-md border-2 border-white flex-shrink-0"></div>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                    <input type="text" defaultValue="Thunderstorm User" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                    <input type="email" defaultValue="admin@thunderstorm.io" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Scheduling AI Preferences */}
        <section className="bg-white rounded-2xl border border-[var(--line)] shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-[var(--line)] flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-bold text-[var(--ink)] uppercase tracking-wider">AI Scheduling Engine</h2>
          </div>
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[var(--ink)]">Work Day Constraints</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-600">Start of Day</label>
                    <select className="bg-gray-50 border border-gray-200 rounded-md text-xs p-1 font-semibold">
                      <option>08:00 AM</option>
                      <option selected>09:00 AM</option>
                      <option>10:00 AM</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-600">End of Day</label>
                    <select className="bg-gray-50 border border-gray-200 rounded-md text-xs p-1 font-semibold">
                      <option>05:00 PM</option>
                      <option selected>06:00 PM</option>
                      <option>07:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[var(--ink)]">Optimization Focus</h3>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-600">Min. Focus Block</label>
                    <span className="text-xs font-bold text-[var(--accent-dark)] bg-green-50 px-2 py-0.5 rounded border border-green-100">90 mins</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-600">Buffer between tasks</label>
                    <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">15 mins</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
               <div className="flex items-start gap-4">
                  <div className="flex items-center h-5">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-[var(--accent)] border-gray-300 rounded focus:ring-[var(--accent)]" />
                  </div>
                  <div className="text-sm">
                    <label className="font-bold text-[var(--ink)] uppercase text-[10px] tracking-wider">Aggressive Batching</label>
                    <p className="text-xs text-[var(--muted)]">Automatically group small tasks together to minimize context switching.</p>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Section: Integrations */}
        <section className="bg-white rounded-2xl border border-[var(--line)] shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-[var(--line)] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-[var(--ink)] uppercase tracking-wider">Integrations</h2>
          </div>
          <div className="p-6 space-y-4">
             <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                      <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.92 3.32-2.12 4.52-1.36 1.36-3.44 2.88-7.84 2.88-6.72 0-12.12-5.48-12.12-12.24s5.4-12.24 12.12-12.24c3.64 0 6.44 1.44 8.36 3.24l2.48-2.48c-2.48-2.36-5.84-4.24-10.84-4.24-9.28 0-16.8 7.52-16.8 16.8s7.52 16.8 16.8 16.8c5.04 0 8.76-1.64 11.84-4.84 3.08-3.08 4.08-7.36 4.08-10.76 0-1.04-.08-1.92-.28-2.76h-15.64z" fill="#4285F4"/></svg>
                   </div>
                   <div>
                      <p className="text-sm font-bold text-[var(--ink)]">Google Calendar</p>
                      <p className="text-xs text-green-600 font-semibold flex items-center gap-1">Connected</p>
                   </div>
                </div>
                <button className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Disconnect</button>
             </div>

             <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                <div className="flex items-center gap-4 opacity-50">
                   <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                      <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52 2.528 2.528 0 0 1 2.522 2.52v6.313A2.528 2.528 0 0 1 8.823 24a2.528 2.528 0 0 1-2.52-2.522v-6.313zM8.823 5.042a2.528 2.528 0 0 1 2.52 2.52 2.528 2.528 0 0 1-2.52 2.522H2.51A2.528 2.528 0 0 1 0 7.562a2.528 2.528 0 0 1 2.51-2.52h6.313zm0 1.261a2.528 2.528 0 0 1-2.52 2.52 2.528 2.528 0 0 1-2.522-2.52V0A2.528 2.528 0 0 1 6.303 0a2.528 2.528 0 0 1 2.52 2.522v6.303zm10.135 3.759a2.528 2.528 0 0 1 2.52-2.52 2.528 2.528 0 0 1 2.522 2.52 2.528 2.528 0 0 1-2.522 2.52h-2.52V10.062zm-1.261 0a2.528 2.528 0 0 1-2.52 2.52 2.528 2.528 0 0 1-2.522-2.52V3.75A2.528 2.528 0 0 1 15.177 1.222a2.528 2.528 0 0 1 2.52 2.522v6.318zm-3.759 10.147a2.528 2.528 0 0 1-2.52-2.522 2.528 2.528 0 0 1 2.52-2.52h6.313A2.528 2.528 0 0 1 24 16.438a2.528 2.528 0 0 1-2.522 2.52h-6.313zm0-1.261a2.528 2.528 0 0 1 2.52-2.52 2.528 2.528 0 0 1 2.522 2.52v6.313A2.528 2.528 0 0 1 17.697 24a2.528 2.528 0 0 1-2.52-2.522v-6.313z" fill="#000000"/></svg>
                   </div>
                   <div>
                      <p className="text-sm font-bold text-[var(--ink)]">Slack</p>
                      <p className="text-xs text-gray-400 font-semibold italic">Not connected</p>
                   </div>
                </div>
                <button className="text-xs font-bold text-[var(--accent-dark)] hover:bg-[var(--accent-soft)] px-3 py-1.5 rounded-lg transition-colors">Connect</button>
             </div>
          </div>
        </section>

        {/* Section: Plan & Billing */}
        <section className="bg-white rounded-2xl border border-[var(--line)] shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-[var(--line)] flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-purple-500" />
            <h2 className="text-sm font-bold text-[var(--ink)] uppercase tracking-wider">Plan & Billing</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div className="space-y-1">
                  <p className="text-lg font-bold text-[var(--ink)]">OptiTime Pro Plan</p>
                  <p className="text-sm text-[var(--muted)]">Your next billing date is <span className="text-[var(--ink)] font-semibold">May 14, 2026</span>.</p>
               </div>
               <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all shadow-sm">
                  Manage Subscription <ExternalLink className="w-3 h-3" />
               </button>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3">
           <button className="px-6 py-2.5 bg-gray-50 text-[var(--muted)] font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
           <button className="btn-primary !px-8 !py-2.5 !text-sm rounded-xl">Save Changes</button>
        </div>

      </div>
    </div>
  );
}
