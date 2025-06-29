# Docker Quick Reference - PFM Web3 Project
*Essential commands and fixes for daily development*

## 🚀 **Quick Start Commands**

### Start All Services
```bash
# Full startup sequence
docker-compose down                                    # Clean slate
docker-compose up -d postgres redis solana-local-validator  # Infrastructure first
sleep 30                                              # Wait for health checks
docker-compose up -d backend admin-portal member-portal     # Applications

# Check status
docker-compose ps
```

### Check Service Health
```bash
# Quick status check
docker-compose ps | grep -E "(healthy|unhealthy|starting)"

# Test endpoints
curl -s http://localhost:3000/health | grep '"status"'     # Backend API
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3001  # Admin Portal
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3002  # Member Portal
```

## 🔧 **Common Fixes**

### Permission Issues (Next.js .next directories)
```bash
# Symptoms: EACCES errors in frontend logs
# Fix: Align ownership with container user
sudo rm -rf frontend/admin/.next frontend/member/.next
sudo chown -R 1001:1001 frontend/admin frontend/member
docker-compose restart admin-portal member-portal
```

### Container Won't Start
```bash
# Check logs
docker-compose logs --tail=20 service-name

# Restart specific service
docker-compose restart service-name

# Rebuild if needed
docker-compose build service-name
docker-compose up -d service-name
```

### Port Conflicts
```bash
# Check what's using ports
netstat -tulpn | grep -E "(3000|3001|3002|5432|6379|8899|8900)"

# Stop conflicting processes
sudo fuser -k 3000/tcp  # Kill process on port 3000
```

## 📊 **Service Ports & URLs**

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Backend API | 3000 | http://localhost:3000 | Authentication, APIs |
| Admin Portal | 3001 | http://localhost:3001 | Management interface |
| Member Portal | 3002 | http://localhost:3002 | User interface |
| PostgreSQL | 5432 | localhost:5432 | Database |
| Redis | 6379 | localhost:6379 | Cache/Sessions |
| Solana RPC | 8899 | http://localhost:8899 | Blockchain |
| Solana WS | 8900 | ws://localhost:8900 | Real-time updates |

## 🩺 **Health Check Commands**

```bash
# Backend API health
curl -s http://localhost:3000/health

# Solana validator health  
curl -s http://localhost:8899 -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'

# Database connection
docker exec pfm-postgres pg_isready -U pfm_user -d pfm_community

# Redis connection
docker exec pfm-redis redis-cli ping
```

## ⚠️ **Known Issues & Quick Fixes**

### Member Portal HTTP 500
**Issue**: Missing Solana wallet adapter dependencies
```bash
# Quick fix (if needed)
cd frontend/member
npm install @solana/wallet-adapter-phantom @solana/wallet-adapter-solflare @solana/wallet-adapter-backpack
cd ../..
docker-compose build member-portal
docker-compose up -d member-portal
```

### Services Won't Stop
```bash
# Force stop all containers
docker-compose down --timeout 10

# Nuclear option (if stuck)
docker stop $(docker ps -q)
docker system prune -f
```

### Disk Space Issues
```bash
# Clean up Docker resources
docker system df                    # Check usage
docker system prune -a             # Remove unused images/containers
docker volume prune                 # Remove unused volumes
```

## 🔍 **Debugging Commands**

```bash
# Container inspection
docker exec -it container-name bash           # Shell into container
docker logs container-name --tail=50 -f      # Follow logs
docker inspect container-name                # Detailed info

# Network debugging
docker network ls                             # List networks
docker network inspect pfm-docker_pfm-network  # Network details

# Volume inspection
docker volume ls                              # List volumes
docker volume inspect volume-name            # Volume details
```

## 📋 **Daily Checklist**

**Before Starting Development:**
- [ ] `docker --version` (ensure Docker is running)
- [ ] `docker-compose ps` (check service status)  
- [ ] `df -h` (check disk space)
- [ ] `ls -la frontend/*/` (verify permissions)

**After Code Changes:**
- [ ] `docker-compose logs service-name` (check for errors)
- [ ] `curl http://localhost:3000/health` (verify backend)
- [ ] Test frontend URLs in browser

**End of Day:**
- [ ] `docker-compose down` (optional - saves resources)
- [ ] Commit changes to git
- [ ] Update this guide if new issues found

---

*Keep this reference handy for daily Docker operations!*

**Quick Links:**
- 📚 [Full Troubleshooting Guide](./DOCKER_TROUBLESHOOTING_GUIDE.md)
- 🐳 [Docker Compose File](./docker-compose.yml)
- 🏠 [Project README](./README.md) 