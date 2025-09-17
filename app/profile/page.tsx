"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  CreditCard,
  PieChart,
  Settings,
  Bell,
  Shield,
  Edit,
  User,
  Mail,
  Phone,
  Download,
  Trash2,
  Check
} from "lucide-react";

const Profile = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [twoFactor, setTwoFactor] = useState(false);
  const [emailNotif, setEmailNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(false);
  const [budgetAlerts, setBudgetAlerts] = useState(false);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setUserData({
          id: user.id,
          email: user.email ?? null,
          full_name: user.user_metadata?.full_name ?? profile?.full_name ?? null,
          avatar_url: user.user_metadata?.avatar_url ?? profile?.avatar_url ?? null,
          phone: profile?.phone ?? null,
          member_since: profile?.member_since ?? null,
          account_type: profile?.account_type ?? null,
          status: profile?.status ?? "Unverified",
          total_balance: profile?.total_balance ?? null,
          monthly_spending: profile?.monthly_spending ?? null,
          savings_progress: profile?.savings_progress ?? null,
          investment: profile?.investment ?? null,
        });
      }

      setLoading(false);
    }

    fetchUser();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4f8 0%, #e6eef7 100%)',
      padding: '24px 16px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '24px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 4px 0'
              }}>Profile Settings</h1>
              <p style={{
                fontSize: '16px',
                color: '#64748b',
                margin: '0'
              }}>Manage your account and preferences</p>
            </div>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontWeight: '500',
              color: '#334155',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              <Edit size={16} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* User Card */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          padding: '32px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              position: 'relative',
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#e2e8f0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}>
              <img
                src={userData.avatar_url ?? "https://www.gravatar.com/avatar?d=mp&f=y"}
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                background: '#3b82f6',
                borderRadius: '50%',
                color: 'white'
              }}>
                <Edit size={14} />
              </div>
            </div>

            <div style={{ flex: '1' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#1e293b',
                margin: '0 0 8px 0'
              }}>{userData.full_name ?? "Unknown User"}</h2>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#64748b'
                }}>
                  <Mail size={16} />
                  <span>{userData.email ?? "Not Provided"}</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#64748b'
                }}>
                  <Phone size={16} />
                  <span>{userData.phone ?? "Not Provided"}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            <InfoItem icon={<User size={16} />} label="Member Since" value={userData.member_since ?? "N/A"} />
            <InfoItem icon={<Wallet size={16} />} label="Account Type" value={userData.account_type ?? "Standard"} />
            <InfoItem icon={<Shield size={16} />} label="Status" value={userData.status ?? "Unverified"} />
          </div>
        </div>

        {/* Financial Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}>
          <MetricCard 
            title="Total Balance" 
            icon={<Wallet size={20} />} 
            value={userData.total_balance !== null ? `$${userData.total_balance}` : "N/A"} 
            trend="%" 
            trendUp 
            color="#3b82f6"
          />
          <MetricCard 
            title="Monthly Spending" 
            icon={<CreditCard size={20} />} 
            value={userData.monthly_spending !== null ? `$${userData.monthly_spending}` : "N/A"} 
            trend="%" 
            trendUp={false} 
            color="#8b5cf6"
          />
          <MetricCard 
            title="Savings Progress" 
            icon={<Target size={20} />} 
            value={userData.savings_progress !== null ? `$${userData.savings_progress} / $12,500` : "N/A"} 
            trend="%" 
            trendUp 
            color="#f59e0b"
            progress={userData.savings_progress ? (userData.savings_progress / 12500) * 100 : undefined}
          />
          <MetricCard 
            title="Investment" 
            icon={<PieChart size={20} />} 
            value={userData.investment !== null ? `$${userData.investment}` : "N/A"} 
            trend="%" 
            trendUp 
            color="#10b981"
          />
        </div>

        {/* Settings Sections */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px'
        }}>
          {/* Account Settings */}
          <Section title="Account Settings" icon={<Settings size={20} />}>
            <InputField icon={<User size={16} />} label="Full Name" defaultValue={userData.full_name ?? ""} />
            <InputField icon={<Mail size={16} />} label="Email Address" defaultValue={userData.email ?? ""} />
            <InputField icon={<Phone size={16} />} label="Phone Number" defaultValue={userData.phone ?? ""} />
            <ToggleSetting 
              label="Two-Factor Authentication" 
              description="Add an extra layer of security to your account" 
              enabled={twoFactor} 
              setEnabled={setTwoFactor} 
            />
          </Section>

          {/* Notification Preferences */}
          <Section title="Notification Preferences" icon={<Bell size={20} />}>
            <ToggleSetting 
              label="Email Notifications" 
              description="Receive budget alerts via email" 
              enabled={emailNotif} 
              setEnabled={setEmailNotif} 
            />
            <ToggleSetting 
              label="Push Notifications" 
              description="Get mobile push notifications" 
              enabled={pushNotif} 
              setEnabled={setPushNotif} 
            />
            <ToggleSetting 
              label="Budget Alerts" 
              description="Alert when approaching budget limits" 
              enabled={budgetAlerts} 
              setEnabled={setBudgetAlerts} 
            />
            <ToggleSetting 
              label="Weekly Reports" 
              description="Receive weekly spending summaries" 
              enabled={weeklyReports} 
              setEnabled={setWeeklyReports} 
            />
            <ToggleSetting 
              label="Privacy Mode" 
              description="Hide sensitive financial data" 
              enabled={privacyMode} 
              setEnabled={setPrivacyMode} 
              icon={<Shield size={16} />}
            />
          </Section>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <ActionButton 
            icon={<Check size={18} />} 
            label="Save Changes" 
            variant="primary" 
            fullWidth 
          />
          <ActionButton 
            icon={<Download size={18} />} 
            label="Export Data" 
            variant="secondary" 
            fullWidth 
          />
          <ActionButton 
            icon={<Trash2 size={18} />} 
            label="Delete Account" 
            variant="danger" 
            fullWidth 
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;

// — Helper components (InfoItem, MetricCard, Section, InputField, ToggleSetting, ActionButton) remain unchanged —


// Helper Components
const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: '#f8fafc',
    borderRadius: '12px'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      background: '#e0f2fe',
      borderRadius: '8px',
      color: '#0ea5e9'
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '14px', color: '#64748b' }}>{label}</div>
      <div style={{ fontSize: '16px', fontWeight: '500', color: '#1e293b' }}>{value}</div>
    </div>
  </div>
);

const MetricCard = ({ title, icon, value, trend, trendUp, color, progress }: { 
  title: string, 
  icon: React.ReactNode, 
  value: string, 
  trend: string, 
  trendUp: boolean, 
  color: string, 
  progress?: number 
}) => (
  <div style={{
    padding: '24px',
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ fontSize: '16px', color: '#64748b', fontWeight: '500' }}>{title}</div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: `${color}15`,
        color: color
      }}>
        {icon}
      </div>
    </div>
    
    <div style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b' }}>{value}</div>
    
    {progress ? (
      <div>
        <div style={{
          height: '8px',
          background: '#e2e8f0',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '8px'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${color} 0%, ${color}99 100%)`,
            borderRadius: '4px'
          }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px'
        }}>
          <span style={{ color: '#64748b' }}>Progress</span>
          <span style={{ color: color, fontWeight: '500' }}>{trend}</span>
        </div>
      </div>
    ) : (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '14px',
        color: trendUp ? '#10b981' : '#ef4444',
        fontWeight: '500'
      }}>
        {trendUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        {trend} from last month
      </div>
    )}
  </div>
);

const Section = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div style={{
    padding: '24px',
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '1px solid #e2e8f0'
    }}>
      <div style={{ color: '#3b82f6' }}>{icon}</div>
      <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: '0' }}>{title}</h3>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {children}
    </div>
  </div>
);

const InputField = ({ icon, label, defaultValue }: { icon: React.ReactNode, label: string, defaultValue: string }) => (
  <div>
    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#94a3b8'
      }}>
        {icon}
      </div>
      <input
        type="text"
        defaultValue={defaultValue}
        style={{
          width: '100%',
          padding: '12px 16px 12px 40px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          fontSize: '16px',
          background: '#f8fafc',
          boxSizing: 'border-box'
        }}
      />
    </div>
  </div>
);

const ToggleSetting = ({ label, description, enabled, setEnabled, icon }: { 
  label: string, 
  description: string, 
  enabled: boolean, 
  setEnabled: (enabled: boolean) => void, 
  icon?: React.ReactNode 
}) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: '1' }}>
      {icon && <div style={{ color: '#64748b' }}>{icon}</div>}
      <div>
        <div style={{ fontSize: '16px', fontWeight: '500', color: '#1e293b', marginBottom: '4px' }}>
          {label}
        </div>
        <div style={{ fontSize: '14px', color: '#64748b' }}>
          {description}
        </div>
      </div>
    </div>
    
    <button
      onClick={() => setEnabled(!enabled)}
      style={{
        position: 'relative',
        width: '52px',
        height: '28px',
        borderRadius: '14px',
        background: enabled ? '#10b981' : '#cbd5e1',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.2s ease'
      }}
    >
      <span style={{
        position: 'absolute',
        top: '2px',
        left: enabled ? '26px' : '2px',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: '#ffffff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        transition: 'left 0.2s ease'
      }} />
    </button>
  </div>
);

// Define the valid variant types
type ButtonVariant = 'primary' | 'secondary' | 'danger';

const ActionButton = ({ 
  icon, 
  label, 
  variant = 'primary', 
  fullWidth = false 
}: { 
  icon: React.ReactNode, 
  label: string, 
  variant?: ButtonVariant, 
  fullWidth?: boolean 
}) => {
  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '16px',
    cursor: 'pointer',
    border: 'none',
    width: fullWidth ? '100%' : 'auto',
    transition: 'all 0.2s ease'
  };
  
  const variants: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: 'white'
    },
    secondary: {
      background: '#f1f5f9',
      color: '#475569',
      border: '1px solid #e2e8f0'
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white'
    }
  };
  
  return (
    <button style={{ ...baseStyle, ...variants[variant] }}>
      {icon}
      {label}
    </button>
  );
};