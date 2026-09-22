# Guia de Troubleshooting - Login

## Problema: Credenciais de Demo Não Funcionam

### Sintoma
Ao tentar fazer login com `demo@example.com` e `demo123`, aparece a mensagem "Invalid email or password".

### Causa
O usuário demo não está sendo criado automaticamente na primeira execução.

### Solução

#### 1. Verificar Console do Browser

Abra o console do browser (F12) e procure por estas mensagens:

```
[AuthService] Creating demo user...
[AuthService] Password hashed successfully
[AuthService] Demo user created successfully
[AuthService] Email: demo@example.com
[AuthService] Password: demo123
```

Se você ver estas mensagens, o usuário demo foi criado com sucesso.

#### 2. Limpar localStorage e Recarregar

Se o usuário demo não foi criado, execute no console:

```javascript
localStorage.clear();
location.reload();
```

Isso vai limpar todos os dados e forçar a criação do usuário demo novamente.

#### 3. Verificar se o Usuário Existe

Execute no console para ver todos os usuários:

```javascript
const users = JSON.parse(localStorage.getItem('users_db') || '[]');
console.log('Total users:', users.length);
users.forEach(u => {
  console.log('Email:', u.email);
  console.log('Name:', u.name);
  console.log('Has password:', !!u.password);
  console.log('---');
});
```

Você deve ver pelo menos um usuário com email `demo@example.com`.

#### 4. Verificar Hash da Senha

Execute no console para testar o hash:

```javascript
async function testHash() {
  const password = 'demo123';
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  console.log('Password:', password);
  console.log('Hash:', hash);
  return hash;
}

testHash();
```

Compare o hash gerado com o hash armazenado no usuário demo.

#### 5. Criar Usuário Manualmente

Se nada funcionar, crie o usuário demo manualmente:

```javascript
async function createDemoUser() {
  const password = 'demo123';
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  const demoUser = {
    id: 'demo_user_001',
    email: 'demo@example.com',
    name: 'Demo User',
    password: hash,
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const users = JSON.parse(localStorage.getItem('users_db') || '[]');
  users.push(demoUser);
  localStorage.setItem('users_db', JSON.stringify(users));
  
  console.log('Demo user created successfully!');
  console.log('Email: demo@example.com');
  console.log('Password: demo123');
}

createDemoUser();
```

Depois recarregue a página e tente fazer login novamente.

### Debug Avançado

Se o problema persistir, ative o modo de debug:

1. Abra o console do browser (F12)
2. Vá para a aba "Console"
3. Tente fazer login
4. Observe as mensagens de log:

```
[AuthService] Login attempt: demo@example.com
[AuthService] Searching for user: demo@example.com
[AuthService] Total users in DB: 1
[AuthService] User found: demo@example.com
[AuthService] User found, verifying password...
[AuthService] Password hashed successfully
[AuthService] Password verification: SUCCESS
[AuthService] Login successful for: demo@example.com
```

Se você ver "Password verification: FAILED", o hash da senha está diferente.

### Problemas Comuns

#### 1. "User not found in DB"
**Causa:** O usuário demo não foi criado.
**Solução:** Limpe o localStorage e recarregue.

#### 2. "Password verification: FAILED"
**Causa:** O hash da senha está diferente.
**Solução:** Crie o usuário demo manualmente (ver passo 5).

#### 3. "Failed to hash password"
**Causa:** O browser não suporta crypto.subtle.
**Solução:** Use um browser moderno (Chrome, Firefox, Edge).

#### 4. "Failed to parse users"
**Causa:** Dados corrompidos no localStorage.
**Solução:** Limpe o localStorage e recarregue.

### Reset Completo

Se nada funcionar, faça um reset completo:

```javascript
// Limpar todos os dados
localStorage.clear();
sessionStorage.clear();

// Recarregar
location.reload();
```

### Contato

Se o problema persistir após tentar todas as soluções acima:

1. Abra o console do browser (F12)
2. Copie todas as mensagens de log
3. Reporte o problema com as mensagens de log

### Credenciais Corretas

- **Email:** `demo@example.com`
- **Password:** `demo123`

### Notas

- O sistema usa SHA-256 para hash de senhas
- As senhas são armazenadas apenas no localStorage
- O usuário demo é criado automaticamente na primeira execução
- Todas as operações de auth são logadas no console
