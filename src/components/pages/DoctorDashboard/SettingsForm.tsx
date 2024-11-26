import { useState } from 'react';
import { Save } from 'lucide-react';
import { useLanguage } from '../../../hooks/useLanguage';

interface Settings {
  consultationFee: number;
  availableForVideo: boolean;
  notificationEmail: boolean;
  notificationSMS: boolean;
  language: string;
}

export default function SettingsForm() {
  const [settings, setSettings] = useState<Settings>({
    consultationFee: 0,
    availableForVideo: false,
    notificationEmail: true,
    notificationSMS: true,
    language: 'fr'
  });
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // API call to save settings
      // Update local state after successful API call
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-6">{t('doctor.settings.title')}</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('doctor.settings.consultationFee')}
          </label>
          <input
            type="number"
            value={settings.consultationFee}
            onChange={(e) => setSettings({ ...settings, consultationFee: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.availableForVideo}
              onChange={(e) => setSettings({ ...settings, availableForVideo: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              {t('doctor.settings.availableForVideo')}
            </span>
          </label>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">{t('doctor.settings.notifications')}</h4>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notificationEmail}
              onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              {t('doctor.settings.emailNotifications')}
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notificationSMS}
              onChange={(e) => setSettings({ ...settings, notificationSMS: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              {t('doctor.settings.smsNotifications')}
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('doctor.settings.language')}
          </label>
          <select
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? t('doctor.settings.saving') : t('doctor.settings.saveChanges')}
        </button>
      </div>
    </form>
  );
}