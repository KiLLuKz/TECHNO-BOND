import React, { useState, useEffect } from 'react';
import * as api from '../../api/juniorApi';
import SeniorDirectoryBox from './comps/SeniorDirectoryBox';
import { DirectorySkeleton } from '../common/Skeletons';

const JuniorDirectoryTab = ({ getDefaultAvatar }) => {
  const [allSeniors, setAllSeniors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeniors = async () => {
      try {
        const seniors = await api.fetchAllSeniors();
        setAllSeniors(seniors);
      } catch (error) {
        console.error("Error fetching seniors:", error);
      }
      setLoading(false);
    };
    fetchSeniors();
  }, []);

  if (loading) return <DirectorySkeleton />;

  return (
    <div className="w-full">
      <SeniorDirectoryBox seniors={allSeniors} getDefaultAvatar={getDefaultAvatar} />
    </div>
  );
};

export default JuniorDirectoryTab;
