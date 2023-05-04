import React from "react";

//OWNER - 1105000000182359
//ADMIN - 1105000000182356
//ROOKIE - 1105000000117726

export function verificarPerms(Profile, rolesPermitidas) {
  return rolesPermitidas.includes(Profile) || Profile === "1105000000182359";
}
