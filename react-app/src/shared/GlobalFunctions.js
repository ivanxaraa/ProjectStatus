//Projects
// 1105000000219615 - Refresh Project
// 1105000000219618 - Edit Project
// 1105000000219621 - Delete Project

import { useEffect } from "react";

//Functions
// 1105000000219624 - Delete Functions

//Roles
// 1105000000219627 - Manage Roles

//ROLES TABLE 
// 1105000000220001 - ROWID OWNER ROLE
// 1105000000230006 - ROWID ROOKIE ROLE


//PROBLEMAS
// SE EU DER O CARGO AO USER E DESPOIS ATUALIZAR AS PERMISSOES DO CARGO NÃO MUDA DO USER


export async function verificarPerms(User, rolePermitida, project) {
  if(User?.Role === '1105000000220001') return true; // owner
  if(project) {
    if(project?.CreatedBy === User.ROWID) return true;
  }
  const { Role_Profiles } = User;
  if (!Role_Profiles) return false;
  const arrayUserProfiles = JSON.parse(Role_Profiles);
  return arrayUserProfiles.includes(rolePermitida);
}

export function sharedProjects(authUser, project) { 
  if (shareProjectWith(authUser, project)) return true;
  const users = JSON.parse(project.Users);
  if(!users) return false;   
  return users.includes(authUser.ROWID) || users.includes(authUser.Role);
}

export function shareProjectWith(authUser, project) { 
  if(authUser?.Role === '1105000000220001') return true; // owner
  if(project?.CreatedBy === authUser.ROWID) return true; // project owner
  return false;
}
