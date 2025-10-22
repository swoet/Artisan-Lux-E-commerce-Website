$body = @{
    email = "auyamhirizhonga@gmail.com"
    name = "Test User"
} | ConvertTo-Json

Write-Host ""
Write-Host "Testing Registration API" -ForegroundColor Cyan
Write-Host "Sending request to http://localhost:3001/api/public/register"
Write-Host "Email: auyamhirizhonga@gmail.com"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/public/register" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body

    Write-Host "Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response Body:" -ForegroundColor Yellow
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    Write-Host ""
    Write-Host "Check your email at: auyamhirizhonga@gmail.com" -ForegroundColor Cyan
    Write-Host "(Also check spam folder!)"
    Write-Host ""
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Error Response: $responseBody" -ForegroundColor Red
    }
}
