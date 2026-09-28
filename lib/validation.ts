const COMMON_PASSWORDS = new Set([
  '12345678','123456789','1234567890','password','password1','password123',
  'qwerty123','qwertyuiop','11111111','00000000','87654321','123123123',
  'abc12345','letmein1','iloveyou','welcome1','admin123','football','baseball',
  '1q2w3e4r','princess','superman','trustno1','sunshine','master12','monkey12'
]);

function isSequential(digitsOrLetters:string):boolean{
  // ascending or descending run, e.g. 1234567890, 0987654321, abcdefgh
  let asc=true,desc=true;
  for(let i=1;i<digitsOrLetters.length;i++){
    const prev=digitsOrLetters.charCodeAt(i-1),cur=digitsOrLetters.charCodeAt(i);
    if(cur-prev!==1)asc=false;
    if(prev-cur!==1)desc=false;
  }
  return asc||desc;
}

export function isValidEmail(email:string):boolean{
  const e=String(email||'').trim();
  // reasonable, not-overly-strict RFC-ish check
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

export function validatePassword(password:string):{ok:true}|{ok:false,message:string}{
  const p=String(password||'');
  if(p.length<8)return {ok:false,message:'Password must be at least 8 characters.'};
  if(p.length>128)return {ok:false,message:'Password is too long.'};
  const lower=p.toLowerCase();
  if(COMMON_PASSWORDS.has(lower))return {ok:false,message:'That password is too common. Please choose a stronger one.'};
  if(/^(\d)\1+$/.test(p))return {ok:false,message:'Password cannot be a single repeated character.'};
  if(/^\d+$/.test(p)&&isSequential(p))return {ok:false,message:'Password cannot be a simple numeric sequence like 1234567890.'};
  if(/^[a-zA-Z]+$/.test(p)&&isSequential(lower))return {ok:false,message:'Password cannot be a simple alphabetical sequence.'};
  const hasLetter=/[a-zA-Z]/.test(p);
  const hasNumber=/[0-9]/.test(p);
  if(!hasLetter||!hasNumber)return {ok:false,message:'Password must include at least one letter and one number.'};
  return {ok:true};
}
