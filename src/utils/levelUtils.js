export const calculateLevel = (totalExp) => {
    return 1 + Math.floor(Math.sqrt((totalExp || 0) / 1000));
};

export const calculateExpProgress = (totalExp) => {
    const currentLevel = calculateLevel(totalExp);
    
    if (currentLevel === 1) {
        return {
            currentLevelExp: totalExp || 0,
            maxLevelExp: 1000
        };
    }
    
    const expForCurrentLevel = 1000 * Math.pow(currentLevel - 1, 2);
    const expForNextLevel = 1000 * Math.pow(currentLevel, 2);
    
    return {
        currentLevelExp: (totalExp || 0) - expForCurrentLevel,
        maxLevelExp: expForNextLevel - expForCurrentLevel
    };
};
