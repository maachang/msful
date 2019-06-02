({
  // Basic definition.
  level: "warn",            // Over warning is valid.
  maxFileSize: 5242880,     // 5MByte.
  logDir: "./log/",         // {project}/log directory.
  
  // Logger definition for system.
  system: {
    level: "info",          // Over info is valid.
    maxFileSize: 1048576    // 1MByte.
  }
})
