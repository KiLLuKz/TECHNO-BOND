// ลบ Type ออกทั้งหมด แต่ยังเก็บ Import ไว้เผื่อจำเป็นต้องใช้โครงสร้างข้อมูล
export const tileIsOccupied = (position, boardState) => {
    const piece = boardState.find((p) => p.samePosition(position));
    // ใช้ !! เพื่อแปลง Object เป็น boolean (ถ้าเจอ piece = true, ถ้าไม่เจอ = false)
    return !!piece;
}

export const tileIsOccupiedByOpponent = (position, boardState, team) => {
    const piece = boardState.find(
      (p) => p.samePosition(position) && p.team !== team
    );
    return !!piece;
}

export const tileIsEmptyOrOccupiedByOpponent = (position, boardState, team) => {
    return (
      !tileIsOccupied(position, boardState) ||
      tileIsOccupiedByOpponent(position, boardState, team)
    );
}