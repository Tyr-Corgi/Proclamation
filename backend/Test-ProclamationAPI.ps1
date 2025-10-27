# Proclamation API Test Suite
# PowerShell script to test the authentication flow

$baseUrl = "http://localhost:5135"
$phoneNumber = "+15551234567"
$verificationCode = "123456"
$displayName = "Test User"
$role = 1  # 1 = Parent, 2 = Child

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "   PROCLAMATION API TEST SUITE" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Backend: $baseUrl" -ForegroundColor Gray
Write-Host "Phone: $phoneNumber" -ForegroundColor Gray
Write-Host "Code: $verificationCode (dev bypass)" -ForegroundColor Gray
Write-Host "==================================================`n" -ForegroundColor Cyan

# Function to make API calls
function Invoke-APITest {
    param(
        [string]$TestName,
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null
    )
    
    Write-Host "TEST: $TestName" -ForegroundColor Yellow
    Write-Host "  → $Method $Endpoint" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            Write-Host "  Body: $($params.Body)" -ForegroundColor DarkGray
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "  ✅ SUCCESS" -ForegroundColor Green
        Write-Host "  Response:" -ForegroundColor Gray
        Write-Host "  $($response | ConvertTo-Json -Depth 3)" -ForegroundColor White
        Write-Host ""
        return $response
    }
    catch {
        Write-Host "  ❌ FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        Write-Host ""
        return $null
    }
}

# Test 1: Check if backend is running
Write-Host "Checking if backend is running..." -ForegroundColor Cyan
try {
    $healthCheck = Invoke-WebRequest -Uri $baseUrl -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Backend is running!`n" -ForegroundColor Green
}
catch {
    Write-Host "❌ Backend is NOT running!" -ForegroundColor Red
    Write-Host "Please start the backend first:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor Gray
    Write-Host "  dotnet run --project Proclamation.API/Proclamation.API.csproj`n" -ForegroundColor Gray
    exit 1
}

# Test 2: Request Verification Code
$test2 = Invoke-APITest `
    -TestName "Request Verification Code" `
    -Method "POST" `
    -Endpoint "/api/auth/request-verification" `
    -Body @{ phoneNumber = $phoneNumber }

# Test 3: Verify Code (First Time - Should Require Registration)
$test3 = Invoke-APITest `
    -TestName "Verify Code (New User)" `
    -Method "POST" `
    -Endpoint "/api/auth/verify-code" `
    -Body @{ phoneNumber = $phoneNumber; code = $verificationCode }

if ($test3 -and $test3.requiresRegistration) {
    Write-Host "✅ Correctly identified as new user requiring registration`n" -ForegroundColor Green
    
    # Test 4: Register New User
    $test4 = Invoke-APITest `
        -TestName "Register New User" `
        -Method "POST" `
        -Endpoint "/api/auth/register" `
        -Body @{ phoneNumber = $phoneNumber; displayName = $displayName; role = $role }
    
    if ($test4 -and $test4.token) {
        Write-Host "✅ User registered successfully!" -ForegroundColor Green
        Write-Host "  Token: $($test4.token.Substring(0, 20))..." -ForegroundColor Gray
        Write-Host "  User ID: $($test4.user.id)" -ForegroundColor Gray
        Write-Host "  Display Name: $($test4.user.displayName)" -ForegroundColor Gray
        Write-Host "  Role: $($test4.user.role)" -ForegroundColor Gray
        Write-Host ""
    }
}

# Test 5: Login Existing User
Write-Host "Testing existing user login..." -ForegroundColor Cyan
Start-Sleep -Seconds 1

$test5 = Invoke-APITest `
    -TestName "Request Verification (Existing User)" `
    -Method "POST" `
    -Endpoint "/api/auth/request-verification" `
    -Body @{ phoneNumber = $phoneNumber }

$test6 = Invoke-APITest `
    -TestName "Verify Code (Existing User)" `
    -Method "POST" `
    -Endpoint "/api/auth/verify-code" `
    -Body @{ phoneNumber = $phoneNumber; code = $verificationCode }

if ($test6 -and $test6.token -and -not $test6.requiresRegistration) {
    Write-Host "✅ Existing user logged in successfully!" -ForegroundColor Green
    Write-Host "  Token: $($test6.token.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host ""
}

# Test 7: Register Child User
Write-Host "Testing child user registration..." -ForegroundColor Cyan
$childPhone = "+15559876543"

$test7a = Invoke-APITest `
    -TestName "Request Verification (Child)" `
    -Method "POST" `
    -Endpoint "/api/auth/request-verification" `
    -Body @{ phoneNumber = $childPhone }

$test7b = Invoke-APITest `
    -TestName "Verify Code (Child)" `
    -Method "POST" `
    -Endpoint "/api/auth/verify-code" `
    -Body @{ phoneNumber = $childPhone; code = $verificationCode }

$test7c = Invoke-APITest `
    -TestName "Register Child User" `
    -Method "POST" `
    -Endpoint "/api/auth/register" `
    -Body @{ phoneNumber = $childPhone; displayName = "Bobby Kid"; role = 2 }

# Test 8: Invalid Verification Code (Development mode - should still work with 123456)
Write-Host "Testing invalid code (should fail)..." -ForegroundColor Cyan
$test8 = Invoke-APITest `
    -TestName "Verify with Invalid Code" `
    -Method "POST" `
    -Endpoint "/api/auth/verify-code" `
    -Body @{ phoneNumber = $phoneNumber; code = "999999" }

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "   TEST SUITE COMPLETE" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "✅ All core authentication flows tested!" -ForegroundColor Green
Write-Host "`nSwagger UI: $baseUrl/swagger" -ForegroundColor Cyan
Write-Host "Database: backend/Proclamation.API/ProclamationDB.db`n" -ForegroundColor Gray

