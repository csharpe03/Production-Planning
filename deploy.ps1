# Run this script from a Jenkins or Hudson job to deploy knockout-express (or your site) to a live site on DEV04

# The following parameters are required to construct the deployment sitePath:
#   -instance: Allowed values are latestCommit, staging, prod, and branch
#   -clientCode: This should be the three digit client code for this project, e.g. DMO
#   -appName: The app name used to create the application directory, e.g. insuranceDash
#   -hostName: The server hosting the application, e.g. OWGUSBP1PRD01
#
# Example usage:
#   .\deploy.ps1 -clientCode DMO -appName insuranceDash -hostName OWGUSBP1PRD01 -instance latestCommit
#       >> sitePath will be "\\OWGUSBP1PRD01\inetpub$\DMO\insuranceDash\latestCommit"
#   .\deploy.ps1 -clientCode DMO -appName knockout-express -hostName OWGUSBP1DEV04 -instance prod
#       >> sitePath will be "\\OWGUSPB1DEV04\inetpub$\DMO\knockout-express\prod"

Param(
    # Instead of using [Parameter(Mandatory=$true)], use the "throw" default in order to make this script fail if a parameter is missing.
    # This avoids asking for user input, useful since this should only be called by CI.
    [Parameter()][ValidateNotNullOrEmpty()][string]$hostName=$(throw 'Parameter "hostName" is required'),
    [Parameter()][ValidateNotNullOrEmpty()][string]$clientCode=$(throw 'Parameter "clientCode" is required'),
    [Parameter()][ValidateNotNullOrEmpty()][string]$appName=$(throw 'Parameter "appName" is required'),
    [Parameter()][ValidateNotNullOrEmpty()][string]$instance=$(throw 'Parameter "instance" is required'),
    # Expose sitePath as an optional parameter, so we can override the default path construction if needed.
    [Parameter(Mandatory=$False)][string]$sitePath="",
    [Parameter(Mandatory=$False)][switch]$useRobocopyPurge
)

$ErrorActionPreference = "Stop"

if(-not (@("latestCommit","staging","prod","branch") -Contains $instance )) {
  write-host "Allowed values for instance are latestCommit, staging, prod, and branch"
  exit
}
if ($sitePath -eq "")
{
    $sitePath = [io.path]::combine("\\" + $hostName, "inetpub$", $clientCode, $appName, $instance)
}

# Run an external command, throw an exception if the command returns non-zero.
# NOTE: Use the -isRobocopy switch to deal with robocopy's weird return codes.
function Exec
{
    [CmdletBinding()]
    param(
        [Parameter(Position=0,Mandatory=1)][ScriptBlock] $cmd,
        [Parameter(Position=1,Mandatory=0)][Switch] $isRobocopy = $false
    )
    $global:LastExitCode = 0
    & $cmd

    $noErrorsOccuredExitCode = 0
    $minimumRobocopyErrorExitCode = 4 # Exit codes of 4 or greater correspond to errors in the robocopy process (http://ss64.com/nt/robocopy-exit.html)

    # $LastExitCode is an automatically-provided variable in PowerShell
    if (
        (!$isRobocopy -and $LastExitCode -ne $noErrorsOccuredExitCode) -or ($isRobocopy -and $LastExitCode -ge $minimumRobocopyErrorExitCode)
    ) {
        throw "ERROR running command: $cmd"
    }

    # Robocopy has terrible exit codes that don't conform to the convention of 0 as successful (see http://ss64.com/nt/robocopy-exit.html)
    # The Jenkins PowerShell plugin (https://wiki.jenkins-ci.org/display/JENKINS/PowerShell+Plugin) now (since 1.3) checks lastExitCode,
    # and fails builds where this is non-zero.
    if ($isRobocopy -and $lastExitCode -lt $minimumRobocopyErrorExitCode) {
        $global:LastExitCode = 0
    }
}

write-host "Building using node version:"
Exec { node --version }

write-host "Building using npm --version:"
Exec { npm --version }

write-host "Installing packages"
Exec { npm install }

write-host "Running tests"
Exec { npm test }

write-host "Running webpack"
Exec { npm run webpack -- -p }

write-host "Removing unused npm packages"
Exec { npm prune --production }

# Required because of npm issue with npm prune removing dependencies installed with git
# Related issue https://github.com/npm/npm/issues/19356
write-host "Reinstalling with --production"
Exec { npm install --production }

# Can't use this yet, since the iis servers don't have the right "overrideModeDefault" settings set for iisnode.  Right now any iisnode.yml file causes a 500 error.
# write-host "Creating iisnode.yml file for `"$instance`" environment"
# echo "node_env: $instance" > server\iisnode.yml

# This is a hack since we can't use the iisnode.yml file, see above.
write-host "Setting node_env to `"$instance`" in `"web.config`""
(Get-Content web.config) -replace 'node_env="[^"]*"',"node_env=`"$instance`"" | Set-Content web.config

if ($useRobocopyPurge) {
    # Copy files & remove any extra ones.  Ensures that \ is "clean".
    # NOTE: DO NOT use /MIR here, that overwrites security settings on folders.  Use "/E /PURGE" instead.
    # All folder exclusions must be done with both "$root" and $sitePath.  Otherwise you'll get different results if the folder exists only in source, only in dest, or in both (or none).
    # You can't use relative imports for subfolders, so you have to use absolute paths (which are source/dest specific).
    $root = split-path $MyInvocation.MyCommand.Path -parent
    write-host "Copying files to $sitePath & removing extra files."
    Exec {
        robocopy . $sitePath /E /R:0 /NP /NS /NJH /NFL /NDL /PURGE `
            /XF dev.js* `
                latestCommit.js* `
                staging.js* `
                prod.js* `
                error-email-config.js* `
                mongoConnectionString.json `
                logging-config.js* `
                build-properties.js* `
            /XD "$root\iisnode" `
                "$root\iisnode\newrelic" `
                "$root\server\iisnode" `
                "$root\server\log" `
                "$root\server\logs" `
                "$root\server\sessions" `
                "$root\server\ssl" `
                "$sitePath\iisnode" `
                "$sitePath\iisnode\newrelic" `
                "$sitePath\server\iisnode" `
                "$sitePath\server\log" `
                "$sitePath\server\logs" `
                "$sitePath\server\sessions" `
                "$sitePath\server\ssl"
    } -isRobocopy
}
else {
    # Copy files, but don't remove any extra ones.
    write-host "Copying files to $sitePath"
    Exec { robocopy . $sitePath /E /R:0 /NP /NS /NJH /NFL /NDL } -isRobocopy
}

write-host "Done."
