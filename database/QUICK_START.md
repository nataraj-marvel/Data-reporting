# Quick Start - Database Installation

## TL;DR - Just Run This!

### Windows (PowerShell - Easiest!)
```powershell
cd D:\Github\reporting\Data-reporting\database
.\Install-Database.ps1
```

### MySQL Workbench
1. Open MySQL Workbench
2. File → Open SQL Script
3. Select `CLEAN_INSTALL.sql`
4. Click ⚡ (Execute)
5. Done!

### Command Line
```bash
mysql -u root -p < CLEAN_INSTALL.sql
```

## What You Get

✅ **13 Core Tables** - Users, Reports, Tasks, Issues, etc.  
✅ **4 Dashboard Views** - Pre-built analytics  
✅ **Admin User** - Username: `admin`, Password: `admin123`  
✅ **Zero Conflicts** - Safe to run on existing databases  

## Login After Installation

1. Start app: `npm run dev`
2. Open: `http://localhost:3000/login`
3. Login: `admin` / `admin123`
4. **Change password immediately!**

## Files Created

| File | Purpose | Lines |
|------|---------|-------|
| `CLEAN_INSTALL.sql` | Main installation script | 600+ |
| `INSTALLATION_README.md` | Detailed guide | 450+ |
| `Install-Database.ps1` | Windows installer | 250+ |
| `QUICK_START.md` | This file | - |

## Troubleshooting

### MySQL not found?
**Option 1:** Add MySQL to PATH  
**Option 2:** Use MySQL Workbench (GUI)  
**Option 3:** Specify full path:
```powershell
.\Install-Database.ps1 -MySQLPath "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
```

### Connection failed?
- Check MySQL service is running
- Verify username/password
- Check firewall settings

### Installation failed?
- Check error message
- Read `INSTALLATION_README.md`
- Ensure no other app is using the database

## Next Steps

1. ✅ Run installation script
2. ✅ Update `.env` file
3. ✅ Test login
4. ✅ Change admin password
5. ✅ Create more users
6. ✅ Start using the app!

---

**Need Help?** Read `INSTALLATION_README.md` for detailed instructions.

