{
  inputs = {
    nixpkgs-24-11.url = "github:nixos/nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    inputs:
    inputs.flake-utils.lib.eachDefaultSystem (
      system:
      let
        nixpkgsArgs = {
          inherit system;
          config = { };
        };
        pkgs = import inputs.nixpkgs-24-11 nixpkgsArgs;
      in
      rec {
        packages = {
          nodejs = pkgs.nodejs_22;
          typescript = pkgs.typescript;
          zip = pkgs.zip;

          default = pkgs.buildNpmPackage {
            pname = "browser-interface";
            version = "1.2.4";
            src = ./.;

            npmDepsHash = "sha256-NCuEffJRM/Doh1KBgVryDGT/Q/PiYQBSbmDH2Jjxflk=";

            buildScript = pkgs.writeShellScript "build" ''
              ${builtins.readFile ./scripts/build.sh}
            '';

            renameHelpersScript = pkgs.writeShellScript "rename-helpers" ''
              ${builtins.readFile ./scripts/rename-helpers.sh}
            '';

            buildPhase = ''
              $buildScript
              npm run build:internal
              $renameHelpersScript
            '';

            installPhase = ''
              zip -r browser-interface.zip dist
              mkdir -p $out
              cp browser-interface.zip $out/browser-interface.zip
            '';

            nativeBuildInputs = [
              packages.zip
            ];

            buildInputs = [
              packages.nodejs
              packages.typescript
            ];
          };
        };

        devShells.default = pkgs.mkShell {
          name = "browser-interface";
          buildInputs = with packages; [
            nodejs
            typescript
            zip
          ];
        };
      }
    );
}
