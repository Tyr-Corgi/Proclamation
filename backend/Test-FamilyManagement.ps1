# PowerShell script to test Family Management features
# Tests family creation, joining, and member management

$baseUrl = "http://localhost:5135/api"
$timestamp = (Get-Date).ToString("HHmmss")
$parentPhone = "+15555551$timestamp".Substring(0, 12)
$childPhone = "+15555552$timestamp".Substring(0, 12)
$testCode = "123456"

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "PROCLAMATION FAMILY MANAGEMENT TEST" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Test 1: Register Parent
Write-Host "`n[1/8] Registering Parent Account..." -ForegroundColor Yellow
try {
    $requestBody = @{
        phoneNumber = $parentPhone
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/Auth/request-verification" `
        -Method POST `
        -Body $requestBody `
        -ContentType "application/json"
    
    Write-Host "Verification sent to $parentPhone" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit
}

# Test 2: Verify Parent Code
Write-Host "`n[2/8] Verifying Parent Code..." -ForegroundColor Yellow
try {
    $verifyBody = @{
        phoneNumber = $parentPhone
        code = $testCode
    } | ConvertTo-Json

    $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/Auth/verify-code" `
        -Method POST `
        -Body $verifyBody `
        -ContentType "application/json"
    
    if ($verifyResponse.requiresRegistration) {
        Write-Host "New user - proceeding to registration" -ForegroundColor Green
        
        # Register parent
        $registerBody = @{
            phoneNumber = $parentPhone
            code = $testCode
            displayName = "Test Parent"
            role = 1
        } | ConvertTo-Json

        $registerResponse = Invoke-RestMethod -Uri "$baseUrl/Auth/register" `
            -Method POST `
            -Body $registerBody `
            -ContentType "application/json"
        
        $parentToken = $registerResponse.token
        Write-Host "Parent registered: $($registerResponse.user.displayName)" -ForegroundColor Green
    } else {
        $parentToken = $verifyResponse.token
        Write-Host "Parent logged in: $($verifyResponse.user.displayName)" -ForegroundColor Green
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit
}

# Test 3: Create Family (as Parent)
Write-Host "`n[3/8] Creating Family..." -ForegroundColor Yellow
try {
    $familyBody = @{
        name = "Test Family"
        defaultAllowance = 10.00
        allowChildrenToCreateChores = $true
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $parentToken"
    }

    $familyResponse = Invoke-RestMethod -Uri "$baseUrl/Family/create" `
        -Method POST `
        -Body $familyBody `
        -ContentType "application/json" `
        -Headers $headers
    
    $inviteCode = $familyResponse.inviteCode
    Write-Host "Family created: $($familyResponse.name)" -ForegroundColor Green
    Write-Host "Invite Code: $inviteCode" -ForegroundColor Cyan
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Details: $($_.Exception.Response)" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Message: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit
}

# Test 4: Get Family Details (as Parent)
Write-Host "`n[4/8] Getting Family Details..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $parentToken"
    }

    $familyDetails = Invoke-RestMethod -Uri "$baseUrl/Family" `
        -Method GET `
        -Headers $headers
    
    Write-Host "Family: $($familyDetails.name)" -ForegroundColor Green
    Write-Host "Members: $($familyDetails.memberCount)" -ForegroundColor Green
    Write-Host "Default Allowance: `$$($familyDetails.defaultAllowance)" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit
}

# Test 5: Register Child
Write-Host "`n[5/8] Registering Child Account..." -ForegroundColor Yellow
try {
    $requestBody = @{
        phoneNumber = $childPhone
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/Auth/request-verification" `
        -Method POST `
        -Body $requestBody `
        -ContentType "application/json"
    
    Write-Host "Verification sent to $childPhone" -ForegroundColor Green

    # Verify child
    $verifyBody = @{
        phoneNumber = $childPhone
        code = $testCode
    } | ConvertTo-Json

    $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/Auth/verify-code" `
        -Method POST `
        -Body $verifyBody `
        -ContentType "application/json"
    
    if ($verifyResponse.requiresRegistration) {
        # Register child
        $registerBody = @{
            phoneNumber = $childPhone
            code = $testCode
            displayName = "Test Child"
            role = 2
        } | ConvertTo-Json

        $registerResponse = Invoke-RestMethod -Uri "$baseUrl/Auth/register" `
            -Method POST `
            -Body $registerBody `
            -ContentType "application/json"
        
        $childToken = $registerResponse.token
        Write-Host "Child registered: $($registerResponse.user.displayName)" -ForegroundColor Green
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit
}

# Test 6: Child Joins Family
Write-Host "`n[6/8] Child Joining Family..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $childToken"
    }

    $joinBody = @{
        inviteCode = $inviteCode
    } | ConvertTo-Json

    $joinResponse = Invoke-RestMethod -Uri "$baseUrl/Family/join" `
        -Method POST `
        -Body $joinBody `
        -ContentType "application/json" `
        -Headers $headers
    
    Write-Host "Child joined family: $($joinResponse.name)" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit
}

# Test 7: Get Family Members (as Parent)
Write-Host "`n[7/8] Getting Family Members..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $parentToken"
    }

    $members = Invoke-RestMethod -Uri "$baseUrl/Family/members" `
        -Method GET `
        -Headers $headers
    
    Write-Host "Total Members: $($members.Count)" -ForegroundColor Green
    foreach ($member in $members) {
        $roleText = if ($member.role -eq 1) { "Parent" } else { "Child" }
        Write-Host "  - $($member.displayName) ($roleText) - Balance: `$$($member.balance)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit
}

# Test 8: Child Views Family
Write-Host "`n[8/8] Child Viewing Family Details..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $childToken"
    }

    $childFamilyView = Invoke-RestMethod -Uri "$baseUrl/Family" `
        -Method GET `
        -Headers $headers
    
    Write-Host "Family Name: $($childFamilyView.name)" -ForegroundColor Green
    Write-Host "Member Count: $($childFamilyView.memberCount)" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "ALL TESTS PASSED!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "`nFamily Management Features:" -ForegroundColor Yellow
Write-Host "  Family Creation" -ForegroundColor Green
Write-Host "  Invite Code Generation" -ForegroundColor Green
Write-Host "  Family Joining" -ForegroundColor Green
Write-Host "  Member Management" -ForegroundColor Green
Write-Host "  Family Settings" -ForegroundColor Green
Write-Host "`nReady for mobile testing!" -ForegroundColor Cyan

