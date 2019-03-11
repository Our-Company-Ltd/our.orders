#module nuget:?package=Cake.DotNetTool.Module&version=0.1.0

#tool dotnet:?package=GitVersion.Tool&version=4.0.1-beta1-58
#tool dotnet:?package=dotnet-xunit-to-junit&version=1.0.0

#addin nuget:?package=Cake.Npm&version=0.16.0
#addin "nuget:?package=Cake.MiniCover&version=0.29.0-next20180721071547&prerelease"

#r Newtonsoft.Json

var target = Argument("target", "Default");
var configuration = Argument("configuration", "Release");

var assemblyVersion = "1.0.0";
var packageVersion = "1.0.0";

var artifactsDir = MakeAbsolute(Directory("artifacts"));
var testsResultsDir = artifactsDir.Combine(Directory("tests-results"));
var packagesDir = MakeAbsolute(artifactsDir.Combine(Directory("packages")));

var coreDir = "../core/lib";
var corePath = coreDir + "/core.csproj";

var coreTestDir = "../core/lib.test";
var coreTestPath = coreTestDir + "/core.test.csproj";

var appPath = "../core/app";
var minicoverPath = "./code-coverage/minicover.csproj";

SetMiniCoverToolsProject(minicoverPath);

Task("Clean")
    .Does(() =>
    {
        CleanDirectory(artifactsDir);

        var settings = new DotNetCoreCleanSettings
        {
            Configuration = configuration
        };

        GetFiles(corePath)
                .ToList()
                .ForEach(f => DotNetCoreClean(f.FullPath, settings));

        GetFiles(coreTestPath)
                .ToList()
                .ForEach(f => DotNetCoreClean(f.FullPath, settings));
    });

Task("Restore")
    .IsDependentOn("Clean")
    .Does(() =>
    {
        GetFiles(corePath)
                .ToList()
                .ForEach(f => DotNetCoreRestore(f.FullPath));

        GetFiles(coreTestPath)
                .ToList()
                .ForEach(f => DotNetCoreRestore(f.FullPath));
    });

Task("BuildApp")
    .IsDependentOn("Restore")
    .WithCriteria(() => !HasArgument("skip-build-app"))
    .Does(() => {
        var dir = MakeAbsolute(Directory(appPath));
        
        // install typescript globally
        NpmInstall(settings => {
            settings.FromPath(dir);
            settings.AddPackage("typescript").InstallGlobally();
            settings.AddPackage("@babel/core").InstallGlobally();
            settings.AddPackage("@babel/cli").InstallGlobally();
        });
        
        // install all from package.json
        var installSettings = new NpmInstallSettings 
        {
            WorkingDirectory = dir,
            Production = false
        };
        NpmInstall(installSettings);

        // build script
        var runSettings = new NpmRunScriptSettings
        {
            ScriptName = "build",
            WorkingDirectory = MakeAbsolute(Directory(appPath)),
            LogLevel = NpmLogLevel.Info
        };

        NpmRunScript(runSettings);
    });

Task("SemVer")
    .IsDependentOn("BuildApp")
    .Does(() =>
    {
        var gitVersionSettings = new GitVersionSettings
        {
            NoFetch = true,
        };

        var gitVersion = GitVersion(gitVersionSettings);

        assemblyVersion = gitVersion.AssemblySemVer;
        packageVersion = gitVersion.NuGetVersion;

        Information($"AssemblySemVer: {assemblyVersion}");
        Information($"NuGetVersion: {packageVersion}");
    });

Task("SetAppVeyorVersion")
    .IsDependentOn("Semver")
    .WithCriteria(() => AppVeyor.IsRunningOnAppVeyor)
    .Does(() =>
    {
        AppVeyor.UpdateBuildVersion(packageVersion);
    });

Task("Build")
    .IsDependentOn("SetAppVeyorVersion")
    .Does(() =>
    {
        var settings = new DotNetCoreBuildSettings
        {
            Configuration = configuration,
            NoIncremental = true,
            NoRestore = true,
            MSBuildSettings = new DotNetCoreMSBuildSettings()
                .SetVersion(assemblyVersion)
                .WithProperty("FileVersion", packageVersion)
                .WithProperty("InformationalVersion", packageVersion)
                .WithProperty("nowarn", "7035")
        };

        if (IsRunningOnLinuxOrDarwin())
        {
            settings.Framework = "netcoreapp2.2";
        }

        GetFiles(corePath)
            .ToList()
            .ForEach(f => DotNetCoreBuild(f.FullPath, settings));

        var testSettings = new DotNetCoreBuildSettings
        {
            Configuration = configuration,
            NoIncremental = true,
            NoRestore = true
        };

        GetFiles(coreTestPath)
            .ToList()
            .ForEach(f => DotNetCoreBuild(f.FullPath, testSettings));
    });

Task("Test")
    .IsDependentOn("Build")
    .Does(() =>
    {
       MiniCover(tool => 
        {
            foreach(var f in GetFiles(coreTestPath))
            {
            
                 var settings = new DotNetCoreTestSettings() {
                    Configuration = configuration,
                    DiagnosticFile = testsResultsDir.Combine($"{f.GetFilenameWithoutExtension()}.xml").FullPath,
                    DiagnosticOutput = true,
                    NoRestore = true,
                    NoBuild = true
                };
                
                DotNetCoreTest(f.FullPath, settings);
            }
        },
        new MiniCoverSettings()
            .WithAssembliesMatching(coreTestDir + "/**/*.dll")
            .WithSourcesMatching(coreDir + "/**/*.cs")
            .WithNonFatalThreshold()
            .GenerateReport(ReportType.CONSOLE | ReportType.XML)
    );

        // GetFiles(coreTestPath)
        //     .ToList()
        //     .ForEach(f => {
        //          var settings = new DotNetCoreTestSettings() {
        //             Configuration = "Release",
        //             DiagnosticFile = testsResultsDir.Combine($"{f.GetFilenameWithoutExtension()}.xml").FullPath,
        //             DiagnosticOutput = true
        //         };
                
        //         DotNetCoreTest(f.FullPath, settings);
        //     });
    })
    .Does(() =>
    {
        if (IsRunningOnCircleCI())
        {
            TransformCircleCITestResults();
        }
    })
    .DeferOnError();



// Task("PublishAppVeyorArtifacts")
//     .IsDependentOn("Pack")
//     .WithCriteria(() => HasArgument("pack") && AppVeyor.IsRunningOnAppVeyor)
//     .Does(() =>
//     {
//         CopyFiles($"{packagesDir}/*.nupkg", MakeAbsolute(Directory("./")), false);

//         GetFiles($"./*.nupkg")
//             .ToList()
//             .ForEach(f => AppVeyor.UploadArtifact(f, new AppVeyorUploadArtifactsSettings { DeploymentName = "packages" }));
//     });


// Get coverage.
#tool "nuget:?package=OpenCover"
#tool "nuget:?package=Codecov&version=1.0.3"
#addin "nuget:?package=Cake.Codecov"
Task("Coverage")
    .IsDependentOn("Test")
    .WithCriteria(() => HasArgument("coverage"))
    .Does(() =>
    {
        
        if (!TravisCI.IsRunningOnTravisCI)
        {
            Warning("Not running on travis, cannot publish coverage");
            return;
        }

        // publish to caverall
        MiniCoverReport(new MiniCoverSettings()
            .WithCoverallsSettings(c => c.UseTravisDefaults())
            .GenerateReport(ReportType.COVERALLS)
        );


       
        var resultsFile = artifactsDir.CombineWithFilePath("coverage.xml");
        foreach(var f in GetFiles(coreTestPath))
        {
            OpenCover(
                x => {   
                    var settings = new DotNetCoreTestSettings() {
                        Configuration = configuration,
                        DiagnosticFile = testsResultsDir.Combine($"{f.GetFilenameWithoutExtension()}.xml").FullPath,
                        DiagnosticOutput = true,
                        NoRestore = true,
                        NoBuild = true
                    };
                
                    return x.DotNetCoreTest(
                     project.FullPath,
                     settings
                    );
                },
                resultsFile,
                new OpenCoverSettings()
                {
                    ArgumentCustomization = args => args
                        .Append("-threshold:40")
                        .Append("-returntargetcode")
                        .Append("-hideskipped:Filter;Attribute"),
                    Register = "user",
                    OldStyle = true,
                    MergeOutput = true
                }
                    .WithFilter("+[Skeleton*]*")
                    .WithFilter("-[xunit*]*")
                    .ExcludeByAttribute("*.ExcludeFromCodeCoverage*")
            );
        }

        Codecov(resultsFile.FullPath);
    });

Task("Pack")
    .IsDependentOn("Coverage")
    .WithCriteria(() => HasArgument("pack"))
    .Does(() =>
    {
        var settings = new DotNetCorePackSettings
        {
            Configuration = configuration,
            NoBuild = true,
            NoRestore = true,
            IncludeSymbols = true,
            OutputDirectory = packagesDir,
            MSBuildSettings = new DotNetCoreMSBuildSettings()
                .WithProperty("PackageVersion", packageVersion)
                .WithProperty("Copyright", $"Copyright Our Company Ltd. {DateTime.Now.Year}")
        };

        if (IsRunningOnLinuxOrDarwin())
        {
            settings.MSBuildSettings.WithProperty("TargetFrameworks", "netcoreapp2.2");
        }

        GetFiles(corePath)
            .ToList()
            .ForEach(f => DotNetCorePack(f.FullPath, settings));
    });

Task("Default")
    .IsDependentOn("Pack");

RunTarget(target);

/// <summary>
/// - No .NET Framework installed, only .NET Core
/// </summary>
private bool IsRunningOnLinuxOrDarwin()
{
    return Context.Environment.Platform.IsUnix();
}

private bool IsRunningOnCircleCI()
{
    return !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("CIRCLECI"));
}

private void TransformCircleCITestResults()
{
    // CircleCI infer the name of the testing framework from the containing folder
    var testResultsCircleCIDir = artifactsDir.Combine("junit/xUnit");
    EnsureDirectoryExists(testResultsCircleCIDir);

    var testResultsFiles = GetFiles($"{testsResultsDir}/*.xml");

    foreach (var testResultsFile in testResultsFiles)
    {
        var inputFilePath = testResultsFile;
        var outputFilePath = testResultsCircleCIDir.CombineWithFilePath(testResultsFile.GetFilename());

        var arguments = new ProcessArgumentBuilder()
            .AppendQuoted(inputFilePath.ToString())
            .AppendQuoted(outputFilePath.ToString())
            .Render();

        var toolName = Context.Environment.Platform.IsUnix() ? "dotnet-xunit-to-junit" : "dotnet-xunit-to-junit.exe";

        var settings = new DotNetCoreToolSettings
        {
            ToolPath = Context.Tools.Resolve(toolName)
        };

        DotNetCoreTool(arguments, settings);
    }
}