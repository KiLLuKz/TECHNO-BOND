import React, { useState, useEffect } from 'react';
import * as api from '../../api/seniorApi';
import JuniorDirectoryBox from './comps/JuniorDirectoryBox';
import { DirectorySkeleton } from '../common/Skeletons';

const SeniorDirectoryTab = ({ userEmail, getDefaultAvatar }) => {
  const [allJuniors, setAllJuniors] = useState([]);
  const [myJuniorIds, setMyJuniorIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJuniors = async () => {
      try {
        const currentStudentId = userEmail?.split('@')[0];
        const juniors = await api.fetchAllJuniors();
        setAllJuniors(juniors);
        
        if (currentStudentId && juniors) {
          const myIds = juniors
            .filter(j => j.senior_student_id === currentStudentId)
            .map(j => j.junior_id);
          setMyJuniorIds(myIds);
        }
      } catch (error) {
        console.error("Error fetching directory:", error);
      }
      setLoading(false);
    };
    fetchJuniors();
  }, [userEmail]);

  if (loading) return <DirectorySkeleton />;

  return <JuniorDirectoryBox allJuniors={allJuniors} myJuniorIds={myJuniorIds} getDefaultAvatar={getDefaultAvatar} />;
};

export default SeniorDirectoryTab;
