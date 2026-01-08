import { useState, useRef, useEffect } from "react";

// Reusable Button
function Button({ children, onClick, variant = "default", size = "md", className = "" }) {
  const baseStyles =
    "rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const sizeStyles =
    size === "sm"
      ? "px-3 py-1 text-sm"
      : size === "lg"
      ? "px-6 py-3 text-lg"
      : "px-4 py-2 text-base";

  const variantStyles =
    variant === "outline"
      ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
      : "bg-[var(--theme-color,#005660)] text-white hover:bg-opacity-90";

  return (
    <button onClick={onClick} className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}>
      {children}
    </button>
  );
}

// Reusable Card
function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-xl shadow-sm ${className}`}>{children}</div>;
}

// Info Row Component with Edit functionality
function UserInfoRow({ label, value, onSave, type = "text" }) {
  const [isEditing, setIsEditing] = useState(false);
  const [fieldValue, setFieldValue] = useState(value);

  const handleSave = () => {
    onSave(fieldValue);
    setIsEditing(false);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="font-medium text-gray-900 min-w-[120px]">{label} :</span>
          {isEditing ? (
            <input
              type={type}
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--theme-color)]"
            />
          ) : (
            <span className="text-gray-600">{label === "Password" ? "************" : value}</span>
          )}
        </div>

        {isEditing ? (
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleSave}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </div>
    </Card>
  );
}

const tabs = [
  { key: "profile", label: "Profile Setting" },
  { key: "account", label: "Account Setting" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  // Business profile states
  const [businessName, setBusinessName] = useState("CWC");
  const [logoPreview, setLogoPreview] = useState(null);
  const [colorTheme, setColorTheme] = useState("#005660");
  const [isEditingBusinessName, setIsEditingBusinessName] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const fileInputRef = useRef(null);
  const colorPickerRef = useRef(null);

  const colorThemes = ["#005660", "#4F46E5", "#DC2626", "#059669", "#7C3AED", "#D97706"];

  // Account settings states
  const [username, setUsername] = useState("Steve Smith");
  const [email, setEmail] = useState("cwc@gmail.com");
  const [password, setPassword] = useState("mypassword");

  // Handle logo upload
  const handleUploadLogo = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Business name
  const handleSaveBusinessName = () => setIsEditingBusinessName(false);
  const handleCancelEditBusinessName = () => setIsEditingBusinessName(false);

  // Color theme
  const handleColorSelect = (color) => {
    setColorTheme(color);
    setIsColorPickerOpen(false);
    document.documentElement.style.setProperty("--theme-color", color);
  };

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
        setIsColorPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--theme-color", colorTheme);
  }, [colorTheme]);

  return (
    <div className="flex-1 p-6 bg-gray-50 space-y-8">
      {/* Tabs */}
      <div className="flex space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-8 py-4 rounded-2xl font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-[var(--theme-color)] text-white shadow"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Settings */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Logo Upload */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Business Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-600 font-bold text-xl">CWC</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Your business logo</h3>
                  <p className="text-sm text-gray-500">WEBP, PNG, SVG or JPEG (max 5MB)</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".webp,.png,.svg,.jpg,.jpeg"
                  className="hidden"
                />
                <Button onClick={handleUploadLogo}>Upload</Button>
                {logoPreview && (
                  <Button variant="outline" onClick={() => setLogoPreview(null)}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Business Name */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                {isEditingBusinessName ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--theme-color)]"
                    />
                    <Button onClick={handleSaveBusinessName}>Save</Button>
                    <Button variant="outline" onClick={handleCancelEditBusinessName}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900">Your business profile name</h3>
                    <p className="text-gray-600">{businessName}</p>
                  </>
                )}
              </div>
              {!isEditingBusinessName && (
                <Button variant="outline" onClick={() => setIsEditingBusinessName(true)}>
                  Edit
                </Button>
              )}
            </div>
          </Card>

          {/* Color Theme */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className="w-10 h-10 rounded-lg border border-gray-200"
                  style={{ backgroundColor: colorTheme }}
                ></div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Color Theme</h3>
                  <p className="text-sm text-gray-500">Selected: {colorTheme}</p>
                </div>
              </div>

              <div className="relative" ref={colorPickerRef}>
                <Button variant="outline" onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}>
                  Change
                </Button>

                {isColorPickerOpen && (
                  <div className="absolute right-0 mt-2 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-10 animate-fadeIn">
                    <h4 className="font-medium text-gray-700 mb-2">Select a color theme</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {colorThemes.map((color) => (
                        <div
                          key={color}
                          className="w-12 h-12 rounded-lg cursor-pointer border border-gray-200 hover:scale-105 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => handleColorSelect(color)}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Account Settings */}
      {activeTab === "account" && (
        <div className="space-y-4">
          <UserInfoRow label="User Name" value={username} onSave={setUsername} />
          <UserInfoRow label="Email" value={email} type="email" onSave={setEmail} />
          <UserInfoRow label="Password" value={password} type="password" onSave={setPassword} />
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-[var(--theme-color)] text-white">Save Changes</Button>
      </div>
    </div>
  );
}
