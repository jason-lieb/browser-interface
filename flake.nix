{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    inputs:
    inputs.flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import inputs.nixpkgs { inherit system; };
        nodejs = pkgs.nodejs_22;
        typescript = pkgs.typescript;
        zip = pkgs.zip;
      in
      {
        packages = {
          default = pkgs.buildNpmPackage {
            pname = "browser-interface";
            version = "1.2.4";
            src = ./.;
            npmDepsHash = "sha256-kJvxigLUHh3Eoh1Ef7xD4d5hrgM7Oyu2DCaDDQQQkbA=";

            buildPhase = ''
              ${builtins.readFile ./scripts/build.sh}
              npm run build:internal
              ${builtins.readFile ./scripts/rename-helpers.sh}
            '';

            installPhase = ''
              zip -r browser-interface.zip dist
              mkdir -p $out
              cp browser-interface.zip $out/browser-interface.zip
            '';

            nativeBuildInputs = [
              zip
            ];

            buildInputs = [
              nodejs
              typescript
            ];
          };
        };

        devShells.default = pkgs.mkShell {
          name = "browser-interface";
          buildInputs = [
            nodejs
            typescript
            zip
          ];
        };
      }
    );
}
