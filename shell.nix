{pkgs ? import <nixpkgs> {}}:
  pkgs.mkShell {
    packages = with pkgs; [
      nodejs-16_x
      nodePackages.yarn
      nodePackages.expo-cli
      nodePackages.eslint_d
    ];
  }
