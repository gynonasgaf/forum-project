import React, { useState, useEffect } from 'react';
import { Crown, Save, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function OwnerPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [siteSettings, setSiteSettings] = useState({
    site_title: 'Elite Forum',
    site_logo_url: ''
  });

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .single();
      
      if (data) {
        setSiteSettings({
          site_title: data.site_title || 'Elite Forum',
          site_logo_url: data.site_logo_url || ''
        });
      }
    } catch (error: any) {
      console.error('Error fetching site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          site_title: siteSettings.site_title,
          site_logo_url: siteSettings.site_logo_url || null
        })
        .eq('id', (await supabase.from('site_settings').select('id').single()).data?.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Site settings updated successfully!' });
      
      // Update the page title
      document.title = siteSettings.site_title;
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Owner Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage site-wide settings and configuration</p>
          </div>
        </div>
        
        <div className="h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${
            message.type === 'success' 
              ? 'text-green-700 dark:text-green-400' 
              : 'text-red-700 dark:text-red-400'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Site Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Upload className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Site Configuration</h2>
          </div>

          <div className="space-y-6">
            {/* Site Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Title
              </label>
              <input
                type="text"
                value={siteSettings.site_title}
                onChange={(e) => setSiteSettings({ ...siteSettings, site_title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter site title"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                This will appear in the browser tab and header
              </p>
            </div>

            {/* Site Logo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Logo URL
              </label>
              <input
                type="url"
                value={siteSettings.site_logo_url}
                onChange={(e) => setSiteSettings({ ...siteSettings, site_logo_url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="https://example.com/logo.png"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Leave empty to use the default crown icon
              </p>
            </div>

            {/* Logo Preview */}
            {siteSettings.site_logo_url && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo Preview
                </label>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <img
                    src={siteSettings.site_logo_url}
                    alt="Site Logo"
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    This is how your logo will appear in the header
                  </span>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Owner Privileges Info */}
      <div className="mt-8 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">Owner Privileges</h3>
            <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
              <li>• Full access to all admin functions</li>
              <li>• Ability to modify site title and logo</li>
              <li>• Cannot have owner status revoked by admins</li>
              <li>• Highest level of forum authority</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}