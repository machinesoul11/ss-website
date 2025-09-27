#!/usr/bin/env node

/**
 * SS Website Resource Fork Cleanup Script for macOS
 * Silently runs in background to remove ._ files that can cause build issues
 * Optimized for Next.js project structure
 */

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

class SSWebsiteResourceForkCleaner {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot
    this.isRunning = false
    this.silentMode = true
    this.watchMode = false
    this.scanInterval = null
    this.watchers = new Set()

    // Only exclude .git to prevent interfering with version control
    this.excludeDirs = new Set(['.git'])

    // Next.js specific critical directories that need immediate cleanup
    this.criticalDirs = new Set([
      'src',
      'public',
      'components',
      'pages',
      'app',
      'lib',
      'types',
      'styles',
      'utils',
      'hooks',
      'contexts',
      'config',
      'build',
      'dist',
      '.next',
      'node_modules',
    ])
  }

  /**
   * Log messages only if not in silent mode
   */
  log(message, force = false) {
    if (!this.silentMode || force) {
      console.log(message)
    }
  }

  /**
   * Log errors (always shown)
   */
  logError(message, error) {
    if (error) {
      console.error(`❌ ${message}:`, error.message)
    } else {
      console.error(`❌ ${message}`)
    }
  }

  /**
   * Check if a directory should be excluded from watching
   */
  shouldExcludeDir(dirPath) {
    const dirName = path.basename(dirPath)
    return this.excludeDirs.has(dirName)
  }

  /**
   * Check if a file is a resource fork file or other macOS metadata
   */
  isResourceForkFile(filename) {
    return (
      filename.startsWith('._') ||
      filename === '.DS_Store' ||
      filename.startsWith('.AppleDouble') ||
      filename.startsWith('.LSOverride')
    )
  }

  /**
   * Check if the path is in a critical directory
   */
  isInCriticalDirectory(filePath) {
    const relativePath = path.relative(this.projectRoot, filePath)
    const topLevelDir = relativePath.split(path.sep)[0]
    return this.criticalDirs.has(topLevelDir)
  }

  /**
   * Delete a resource fork file immediately with aggressive retries
   */
  async deleteResourceForkImmediately(filePath) {
    const maxRetries = 5
    let attempt = 0

    while (attempt < maxRetries) {
      try {
        // Check if file exists before attempting deletion
        await fs.promises.access(filePath)
        await fs.promises.unlink(filePath)

        // Only log if not in silent mode or if it's a critical file or watch mode
        const isCritical = this.isInCriticalDirectory(filePath)
        if (!this.silentMode || isCritical || this.watchMode) {
          const relPath = path.relative(this.projectRoot, filePath)
          this.log(
            `🗑️  ${this.watchMode ? 'Watch' : 'Cleaned'}: ${relPath}`,
            isCritical || this.watchMode
          )
        }
        return true
      } catch (error) {
        attempt++
        if (error.code === 'ENOENT') {
          // File doesn't exist, consider it a success
          return true
        }

        if (attempt < maxRetries) {
          // Brief wait before retry, but shorter in watch mode
          const delay = this.watchMode ? 10 : 50
          await new Promise((resolve) => setTimeout(resolve, delay))
        } else {
          // Only log persistent errors in watch mode or non-silent mode
          if (this.watchMode || !this.silentMode) {
            const relPath = path.relative(this.projectRoot, filePath)
            this.logError(
              `Failed to delete ${relPath} after ${maxRetries} attempts`,
              error
            )
          }
          return false
        }
      }
    }
  }

  /**
   * Delete a resource fork file during scan
   */
  async deleteResourceFork(filePath) {
    try {
      await fs.promises.unlink(filePath)

      // Only log if not in silent mode
      if (!this.silentMode) {
        const relPath = path.relative(this.projectRoot, filePath)
        this.log(`🗑️  Scan cleaned: ${relPath}`)
      }
      return true
    } catch (error) {
      if (error.code !== 'ENOENT') {
        const relPath = path.relative(this.projectRoot, filePath)
        this.logError(`Failed to delete ${relPath}`, error)
      }
      return false
    }
  }

  /**
   * Recursively scan directory for resource fork files
   */
  async scanAndClean(dir) {
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          if (!this.shouldExcludeDir(fullPath)) {
            await this.scanAndClean(fullPath)
          }
        } else if (this.isResourceForkFile(entry.name)) {
          await this.deleteResourceFork(fullPath)
        }
      }
    } catch (error) {
      // Silently ignore permission errors and other scan issues
      if (
        error.code !== 'EACCES' &&
        error.code !== 'ENOENT' &&
        !this.silentMode
      ) {
        const relPath = path.relative(this.projectRoot, dir)
        this.logError(`Error scanning ${relPath}`, error)
      }
    }
  }

  /**
   * Initial cleanup - remove all existing resource fork files
   */
  async initialCleanup() {
    if (!this.silentMode) {
      this.log('🧹 Starting SS Website resource fork cleanup...')
      this.log('   🎯 Scanning entire project for ._* and .DS_Store files')
    }

    // Clean critical directories first
    for (const criticalDir of this.criticalDirs) {
      const dirPath = path.join(this.projectRoot, criticalDir)
      try {
        await fs.promises.access(dirPath)
        await this.scanAndClean(dirPath)
      } catch (error) {
        // Directory doesn't exist, skip silently
      }
    }

    // Clean entire project
    await this.scanAndClean(this.projectRoot)

    if (!this.silentMode) {
      this.log('✅ Initial cleanup completed\n')
    }
  }

  /**
   * Use fsevents on macOS for efficient file system watching
   */
  async startMacOSWatcher() {
    return new Promise((resolve, reject) => {
      // Use fswatch for efficient macOS file system monitoring with more events
      const fswatch = exec(
        `fswatch -r -l 0.1 --event Created --event Renamed --event Updated --event MovedTo --event AttributeModified "${this.projectRoot}"`,
        {
          maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        }
      )

      // Store the fswatch process for cleanup
      this.watchers.add(fswatch)

      fswatch.stdout.on('data', (data) => {
        const files = data.toString().trim().split('\n').filter(Boolean)

        // Process files immediately in parallel
        files.forEach(async (filePath) => {
          const filename = path.basename(filePath)
          if (this.isResourceForkFile(filename)) {
            // Immediate deletion - no delay, don't await to process in parallel
            setImmediate(() => this.deleteResourceForkImmediately(filePath))
          }
        })
      })

      fswatch.stderr.on('data', (data) => {
        if (!this.silentMode) {
          this.logError('fswatch error', { message: data.toString() })
        }
      })

      fswatch.on('error', (error) => {
        this.watchers.delete(fswatch)
        reject(error)
      })

      fswatch.on('close', (code) => {
        this.watchers.delete(fswatch)
        if (code !== 0 && this.isRunning) {
          reject(new Error(`fswatch exited with code ${code}`))
        }
      })

      if (!this.silentMode) {
        this.log('👀 Started file system watcher using fswatch')
      }
      resolve(fswatch)
    })
  }

  /**
   * Fallback watcher using Node.js fs.watch
   */
  async startFallbackWatcher() {
    if (!this.silentMode) {
      this.log('👀 Starting fallback file system watcher...')
    }

    const watchRecursive = async (dir) => {
      try {
        const watcher = fs.watch(
          dir,
          { recursive: true },
          async (eventType, filename) => {
            if (filename && this.isResourceForkFile(filename)) {
              const filePath = path.join(dir, filename)
              // Immediate deletion
              await this.deleteResourceForkImmediately(filePath)
            }
          }
        )

        this.watchers.add(watcher)

        // Also watch subdirectories explicitly for better coverage
        try {
          const entries = await fs.promises.readdir(dir, {
            withFileTypes: true,
          })
          for (const entry of entries) {
            if (
              entry.isDirectory() &&
              !this.shouldExcludeDir(path.join(dir, entry.name))
            ) {
              const subWatcher = fs.watch(
                path.join(dir, entry.name),
                { recursive: true },
                async (eventType, filename) => {
                  if (filename && this.isResourceForkFile(filename)) {
                    const filePath = path.join(dir, entry.name, filename)
                    await this.deleteResourceForkImmediately(filePath)
                  }
                }
              )
              this.watchers.add(subWatcher)
            }
          }
        } catch (subError) {
          // Ignore subdirectory errors
        }
      } catch (error) {
        // Only log non-permission errors in non-silent mode
        if (error.code !== 'EACCES' && !this.silentMode) {
          const relPath = path.relative(this.projectRoot, dir)
          this.logError(`Error watching ${relPath}`, error)
        }
      }
    }

    await watchRecursive(this.projectRoot)
  }

  /**
   * Next.js specific build cleanup
   */
  async cleanupBuildArtifacts() {
    const buildDirs = ['.next', 'dist', 'build', 'out']

    for (const buildDir of buildDirs) {
      const fullPath = path.join(this.projectRoot, buildDir)
      try {
        await fs.promises.access(fullPath)
        await this.scanAndClean(fullPath)
      } catch (error) {
        // Directory doesn't exist, skip silently
      }
    }
  }

  /**
   * Start continuous scanning for watch mode
   */
  startContinuousScanning() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval)
    }

    // More aggressive scanning in watch mode - every 2 seconds
    const scanFrequency = this.watchMode ? 2000 : 30000

    this.scanInterval = setInterval(async () => {
      await this.scanAndClean(this.projectRoot)
      await this.cleanupBuildArtifacts()
    }, scanFrequency)

    if (!this.silentMode && this.watchMode) {
      this.log(`🔄 Continuous scanning every ${scanFrequency / 1000} seconds`)
    }
  }

  /**
   * Start the resource fork cleaner
   */
  async start(options = {}) {
    if (this.isRunning) {
      this.log('Resource fork cleaner is already running')
      return
    }

    this.isRunning = true
    this.silentMode = options.silent !== false // Default to silent mode
    this.watchMode = options.watch === true

    if (!this.silentMode) {
      this.log(`🚀 Starting SS Website Resource Fork Cleaner`)
      this.log(`   📁 Project root: ${this.projectRoot}`)
      this.log(
        `   💀 Mode: ${this.watchMode ? 'Aggressive watch mode' : 'Silent background cleanup'} of all ._* files`
      )
    }

    // Initial cleanup
    await this.initialCleanup()

    // Clean build artifacts
    await this.cleanupBuildArtifacts()

    if (this.watchMode) {
      // In watch mode, start file system watchers
      if (process.platform === 'darwin') {
        try {
          // Check if fswatch is available
          await new Promise((resolve, reject) => {
            exec('which fswatch', (error) => {
              if (error) reject(error)
              else resolve()
            })
          })

          await this.startMacOSWatcher()
        } catch (error) {
          if (!this.silentMode) {
            this.log('⚠️  fswatch not available, using fallback watcher')
            this.log(
              '💡 Install fswatch for better performance: brew install fswatch'
            )
          }
          await this.startFallbackWatcher()
        }
      } else {
        await this.startFallbackWatcher()
      }
    }

    // Start continuous scanning
    this.startContinuousScanning()

    if (!this.silentMode) {
      this.log('✨ Resource fork cleaner is now running')
      if (this.watchMode) {
        this.log('   👀 File system watchers active')
        this.log('   🔄 Aggressive continuous scanning enabled')
      }
      this.log('   🎯 Monitoring all directories for ._* file deletion')
      if (this.watchMode) {
        this.log('   Press Ctrl+C to stop\n')
      }
    }
  }

  /**
   * Stop the cleaner
   */
  stop() {
    this.isRunning = false

    // Clear the scan interval
    if (this.scanInterval) {
      clearInterval(this.scanInterval)
      this.scanInterval = null
    }

    // Close all watchers
    for (const watcher of this.watchers) {
      try {
        watcher.close()
      } catch (error) {
        // Ignore errors when closing watchers
      }
    }
    this.watchers.clear()

    if (!this.silentMode) {
      this.log('🛑 Resource fork cleaner stopped')
    }
  }
}

// CLI interface
if (require.main === module) {
  const projectRoot = process.cwd()
  const cleaner = new SSWebsiteResourceForkCleaner(projectRoot)

  // Parse command line arguments
  const args = process.argv.slice(2)
  const options = {
    silent: !args.includes('--verbose') && !args.includes('-v'),
    watch: args.includes('--watch') || args.includes('-w'),
  }

  // Show help if requested
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
SS Website Resource Fork Cleaner

Usage: node cleanup-resource-forks.js [options]

Options:
  --watch, -w      Enable watch mode with aggressive scanning and file system monitoring
  --verbose, -v    Enable verbose logging (default: silent)
  --help, -h       Show this help message

Examples:
  node cleanup-resource-forks.js                    # Run once and exit (silent)
  node cleanup-resource-forks.js --verbose          # Run once with logging
  node cleanup-resource-forks.js --watch            # Continuous background watching (silent)
  node cleanup-resource-forks.js --watch --verbose  # Continuous watching with logging
    `)
    process.exit(0)
  }

  // Graceful shutdown
  process.on('SIGINT', () => {
    if (!options.silent) {
      console.log('\n👋 Shutting down resource fork cleaner...')
    }
    cleaner.stop()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    cleaner.stop()
    process.exit(0)
  })

  // Handle uncaught errors silently in production
  process.on('uncaughtException', (error) => {
    if (!options.silent) {
      console.error('💥 Uncaught exception:', error)
    }
    cleaner.stop()
    process.exit(1)
  })

  // Start the cleaner
  if (options.watch) {
    // Watch mode - run continuously
    cleaner.start(options).catch((error) => {
      if (!options.silent) {
        console.error('❌ Failed to start resource fork cleaner:', error)
      }
      process.exit(1)
    })
  } else {
    // Run once mode - clean and exit
    cleaner
      .start({ ...options, watch: false })
      .then(async () => {
        // Give it a moment to complete initial cleanup
        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (!options.silent) {
          console.log('✅ One-time cleanup completed')
        }

        cleaner.stop()
        process.exit(0)
      })
      .catch((error) => {
        if (!options.silent) {
          console.error('❌ Failed to run resource fork cleaner:', error)
        }
        process.exit(1)
      })
  }
}

module.exports = SSWebsiteResourceForkCleaner
