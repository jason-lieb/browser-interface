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
        nixpkgs-24-11 = import inputs.nixpkgs-24-11 nixpkgsArgs;
      in
      rec {
        packages = {
          nodejs = nixpkgs-24-11.nodejs_22;
          typescript = nixpkgs-24-11.typescript;
          zip = nixpkgs-24-11.zip;
        };
        devShells.default = nixpkgs-24-11.mkShell {
          name = "browser-interface";
          buildInputs = with packages; [
            nodejs
            typescript
            zip
          ];
          shellHook = ''
            npm install
          '';
        };
      }
    );

  nixConfig = {
    extra-substituters = [
      "https://freckle.cachix.org"
      "https://freckle-private.cachix.org"
    ];
    extra-trusted-public-keys = [
      "freckle.cachix.org-1:WnI1pZdwLf2vnP9Fx7OGbVSREqqi4HM2OhNjYmZ7odo="
      "freckle-private.cachix.org-1:zbTfpeeq5YBCPOjheu0gLyVPVeM6K2dc1e8ei8fE0AI="
    ];
  };
}
