import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../../api/juniorApi';
import ProfileBox from './comps/ProfileBox';
import { ProfileSkeleton } from '../common/Skeletons';

const JuniorProfileTab = ({ userId, userEmail, notify, getDefaultAvatar }) => {
  const [profile, setProfile] = useState({ username: '', avatar_url: '', student_id: '' });
  const [clueData, setClueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentId = userEmail?.split('@')[0];
        const { clue, prof } = await api.fetchDashboardData(studentId, userId);
        setProfile(prof || { username: studentId, avatar_url: '', student_id: studentId });
        setClueData(clue);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
      setLoading(false);
    };
    if (userId && userEmail) fetchData();
  }, [userId, userEmail]);

  const handleUploadAvatar = useCallback(async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      const publicUrl = await api.uploadAvatar(userId, file);
      await api.updateProfile(userId, { avatar_url: publicUrl, username: profile.username, student_id: profile.student_id });
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      notify("SYSTEM: Avatar updated!");
    } catch (error) { notify("ERROR: " + error.message); }
  }, [userId, profile.username, profile.student_id, notify]);

  const handleUpdateProfile = useCallback(async () => {
    setIsSaving(true);
    try {
        await api.updateProfile(userId, { username: profile.username, avatar_url: profile.avatar_url, student_id: profile.student_id });
        notify("SYSTEM: Profile updated successfully!");
    } catch (error) { notify("ERROR: " + error.message); }
    setIsSaving(false);
  }, [userId, profile, notify]);

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="w-full max-w-7xl mx-auto">
      <ProfileBox 
        profile={profile} 
        setProfile={setProfile} 
        handleUploadAvatar={handleUploadAvatar} 
        handleUpdateProfile={handleUpdateProfile} 
        isSaving={isSaving} 
        defaultAvatar={getDefaultAvatar('junior', clueData?.junior_id)}
        userEmail={userEmail}
        notify={notify}
      />
    </div>
  );
};

export default JuniorProfileTab;
