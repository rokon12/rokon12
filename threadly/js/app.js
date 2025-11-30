        let currentThreadDump = null;
        let expandedContainers = new Set();
        let currentFilters = {
            search: '',
            states: {
                waiting: true,
                sleeping: true,
                runnable: true,
                blocked: true
            }
        };

        // Settings management
        const STORAGE_KEYS = {
            THEME: 'threadly-theme',
            FILTERS: 'threadly-filters',
            EXPANDED: 'threadly-expanded',
            RECENT_FILES: 'threadly-recent-files'
        };

        // Recent files management
        let recentFiles = [];
        const MAX_RECENT_FILES = 5;

        function loadRecentFiles() {
            const saved = localStorage.getItem(STORAGE_KEYS.RECENT_FILES);
            if (saved) {
                try {
                    const metadata = JSON.parse(saved);
                    recentFiles = metadata.map(meta => {
                        // Try to load the data for each file
                        const dataKey = `${STORAGE_KEYS.RECENT_FILES}_data_${meta.name}_${meta.timestamp}`;
                        const data = localStorage.getItem(dataKey);
                        return {
                            ...meta,
                            data: data // Will be null if not found
                        };
                    });
                    updateRecentFilesUI();
                } catch (e) {
                    console.error('Failed to load recent files:', e);
                    recentFiles = [];
                }
            }
        }

        function addRecentFile(fileName, fileData) {
            const fileInfo = {
                name: fileName,
                size: fileData.length,
                timestamp: Date.now(),
                processId: currentThreadDump?.processId || 'Unknown',
                threadCount: currentThreadDump ? 
                    currentThreadDump.threadContainers.reduce((sum, container) => 
                        sum + parseInt(container.threadCount || container.threads?.length || 0), 0) : 0,
                data: fileData // Store the actual data
            };

            // Remove if already exists
            recentFiles = recentFiles.filter(f => f.name !== fileName);
            
            // Add to beginning
            recentFiles.unshift(fileInfo);
            
            // Keep only MAX_RECENT_FILES
            if (recentFiles.length > MAX_RECENT_FILES) {
                recentFiles = recentFiles.slice(0, MAX_RECENT_FILES);
            }
            
            // Store both metadata and data separately for better management
            const metadataForStorage = recentFiles.map(f => ({
                name: f.name,
                size: f.size,
                timestamp: f.timestamp,
                processId: f.processId,
                threadCount: f.threadCount
            }));
            
            localStorage.setItem(STORAGE_KEYS.RECENT_FILES, JSON.stringify(metadataForStorage));
            
            // Store data separately with a key based on filename and timestamp
            recentFiles.forEach(file => {
                if (file.data) {
                    const dataKey = `${STORAGE_KEYS.RECENT_FILES}_data_${file.name}_${file.timestamp}`;
                    localStorage.setItem(dataKey, file.data);
                }
            });
            
            updateRecentFilesUI();
        }

        function updateRecentFilesUI() {
            const count = recentFiles.length;
            const countEl = document.getElementById('recentFileCount');
            const listEl = document.getElementById('recentFilesList');
            
            if (count > 0) {
                countEl.textContent = count;
                countEl.style.display = 'inline-block';
                
                listEl.innerHTML = recentFiles.map((file, index) => `
                    <div class="recent-file-item" onclick="loadRecentFile(${index})">
                        <div class="recent-file-name">${file.name}</div>
                        <div class="recent-file-details">
                            ${file.threadCount} threads • ${new Date(file.timestamp).toLocaleDateString()}
                        </div>
                    </div>
                `).join('');
                
                listEl.innerHTML += '<div class="clear-recent" onclick="clearRecentFiles()">Clear Recent Files</div>';
            } else {
                countEl.style.display = 'none';
                listEl.innerHTML = '<div class="no-recent-files">No recent files</div>';
            }
        }

        function loadRecentFile(index) {
            const file = recentFiles[index];
            if (file && file.data) {
                try {
                    const data = JSON.parse(file.data);
                    processThreadDump(data);
                    toggleRecentFiles(); // Close dropdown
                } catch (e) {
                    showError('Failed to load recent file: ' + e.message);
                }
            } else {
                showError('Recent file data not available. Please re-upload the file.');
            }
        }

        function clearRecentFiles() {
            if (confirm('Clear all recent files?')) {
                // Clear data for each recent file
                recentFiles.forEach(file => {
                    const dataKey = `${STORAGE_KEYS.RECENT_FILES}_data_${file.name}_${file.timestamp}`;
                    localStorage.removeItem(dataKey);
                });
                
                recentFiles = [];
                localStorage.removeItem(STORAGE_KEYS.RECENT_FILES);
                updateRecentFilesUI();
            }
        }

        function toggleRecentFiles() {
            const dropdown = document.getElementById('recentFilesDropdown');
            dropdown.classList.toggle('show');
        }

        function loadSettings() {
            // Load theme
            const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            
            // Load recent files
            loadRecentFiles();

            // Load filter settings
            const savedFilters = localStorage.getItem(STORAGE_KEYS.FILTERS);
            if (savedFilters) {
                try {
                    const filters = JSON.parse(savedFilters);
                    currentFilters = { ...currentFilters, ...filters };
                    
                    // Apply filter settings to UI
                    document.getElementById('filterWaiting').checked = currentFilters.states.waiting;
                    document.getElementById('filterSleeping').checked = currentFilters.states.sleeping;
                    document.getElementById('filterRunnable').checked = currentFilters.states.runnable;
                    document.getElementById('filterBlocked').checked = currentFilters.states.blocked;
                } catch (e) {
                    console.error('Failed to load filter settings:', e);
                }
            }

            // Load expanded state
            const savedExpanded = localStorage.getItem(STORAGE_KEYS.EXPANDED);
            if (savedExpanded) {
                try {
                    expandedContainers = new Set(JSON.parse(savedExpanded));
                } catch (e) {
                    console.error('Failed to load expanded state:', e);
                }
            }
        }

        function saveFilterSettings() {
            localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(currentFilters));
        }

        function saveExpandedState() {
            localStorage.setItem(STORAGE_KEYS.EXPANDED, JSON.stringify([...expandedContainers]));
        }

        // Theme management
        function initTheme() {
            loadSettings();
        }

        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
        }

        // File upload handling
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        });

        function handleFile(file) {
            if (!file.name.endsWith('.json')) {
                showError('Please upload a JSON file');
                return;
            }

            showLoading('Reading file...');

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    updateLoadingText('Parsing JSON data...');
                    const data = JSON.parse(e.target.result);
                    
                    updateLoadingText('Processing thread dump...');
                    setTimeout(() => {
                        processThreadDump(data);
                        // Save to recent files after successful processing
                        addRecentFile(file.name, e.target.result);
                        hideLoading();
                    }, 100); // Small delay to ensure UI updates
                } catch (error) {
                    hideLoading();
                    showError('Invalid JSON file: ' + error.message);
                }
            };
            reader.onerror = () => {
                hideLoading();
                showError('Failed to read file');
            };
            reader.readAsText(file);
        }

        function showLoading(text = 'Processing...') {
            const overlay = document.getElementById('loadingOverlay');
            const details = document.getElementById('loadingDetails');
            details.textContent = text;
            overlay.style.display = 'flex';
        }

        function updateLoadingText(text) {
            document.getElementById('loadingDetails').textContent = text;
        }

        function hideLoading() {
            document.getElementById('loadingOverlay').style.display = 'none';
        }

        function showHelp() {
            document.getElementById('helpOverlay').style.display = 'flex';
        }

        function hideHelp() {
            document.getElementById('helpOverlay').style.display = 'none';
        }

        function printView() {
            // Expand all containers for printing
            expandAll();
            
            // Show all stack traces for printing
            document.querySelectorAll('.stack-trace').forEach(trace => {
                trace.classList.add('show');
            });
            
            // Trigger print dialog
            setTimeout(() => {
                window.print();
            }, 100);
        }

        function showError(message) {
            const errorEl = document.getElementById('errorMessage');
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, 5000);
        }

        function processThreadDump(data) {
            if (!data.threadDump || !data.threadDump.threadContainers) {
                showError('Invalid thread dump format');
                return;
            }

            currentThreadDump = data.threadDump;
            
            // Show progress for large dumps
            if (data.threadDump.threadContainers.length > 10) {
                updateLoadingText(`Processing ${data.threadDump.threadContainers.length} containers...`);
            }
            
            // When loading a new dump, expand all containers by default
            expandedContainers.clear();
            data.threadDump.threadContainers.forEach(container => {
                expandedContainers.add(container.container);
            });
            saveExpandedState();
            
            updateStats();
            
            // Show rendering progress for very large dumps
            const totalThreads = data.threadDump.threadContainers.reduce((sum, container) => 
                sum + parseInt(container.threadCount || container.threads?.length || 0), 0);
            if (totalThreads > 100) {
                updateLoadingText(`Rendering ${totalThreads} threads...`);
            }
            
            // Use setTimeout to allow UI to update before rendering
            setTimeout(() => {
                renderTree();
            }, 10);
            
            document.getElementById('uploadSection').style.display = 'none';
            document.getElementById('analysisView').style.display = 'block';
        }

        function updateStats() {
            const dump = currentThreadDump;
            document.getElementById('processId').textContent = dump.processId || '-';
            document.getElementById('runtimeVersion').textContent = dump.runtimeVersion || '-';
            document.getElementById('timestamp').textContent = new Date(dump.time).toLocaleString();
            
            let totalThreads = 0;
            const stateCounts = {
                WAITING: 0,
                SLEEPING: 0,
                RUNNABLE: 0,
                BLOCKED: 0
            };
            
            // Count threads by state
            dump.threadContainers.forEach(container => {
                if (container.threads) {
                    container.threads.forEach(thread => {
                        const state = detectThreadState(thread);
                        stateCounts[state]++;
                        totalThreads++;
                    });
                } else {
                    totalThreads += parseInt(container.threadCount || 0);
                }
            });
            
            document.getElementById('totalThreads').textContent = totalThreads;
            document.getElementById('totalContainers').textContent = dump.threadContainers.length;
            
            // Update thread state summary
            updateThreadStateSummary(stateCounts, totalThreads);
            
            // Run advanced analysis
            runDeadlockDetection();
            runPerformanceAnalysis(stateCounts, totalThreads);
        }

        function updateThreadStateSummary(stateCounts, totalThreads) {
            const summaryContent = document.getElementById('stateSummaryContent');
            const summaryBar = document.getElementById('stateSummaryBar');
            const pieChart = document.getElementById('pieChart');
            
            summaryContent.innerHTML = '';
            summaryBar.innerHTML = '';
            pieChart.innerHTML = '';
            
            const states = [
                { name: 'WAITING', emoji: '🟡', color: '#FFC107' },
                { name: 'SLEEPING', emoji: '🟣', color: '#9C27B0' },
                { name: 'RUNNABLE', emoji: '🟢', color: '#4CAF50' },
                { name: 'BLOCKED', emoji: '🔴', color: '#F44336' }
            ];
            
            // Create pie chart
            let currentAngle = 0;
            const hasData = totalThreads > 0 && !Object.values(stateCounts).every(count => count === 0);
            
            if (hasData) {
                states.forEach(state => {
                    const count = stateCounts[state.name];
                    if (count > 0) {
                        const percentage = (count / totalThreads) * 100;
                        const angle = (percentage / 100) * 360;
                        
                        const slice = document.createElement('div');
                        slice.style.position = 'absolute';
                        slice.style.width = '100%';
                        slice.style.height = '100%';
                        slice.style.background = `conic-gradient(from ${currentAngle}deg, ${state.color} 0deg, ${state.color} ${angle}deg, transparent ${angle}deg)`;
                        
                        pieChart.appendChild(slice);
                        currentAngle += angle;
                    }
                });
                
                // Add center circle for donut effect
                const center = document.createElement('div');
                center.style.position = 'absolute';
                center.style.top = '20%';
                center.style.left = '20%';
                center.style.width = '60%';
                center.style.height = '60%';
                center.style.backgroundColor = 'var(--bg-secondary)';
                center.style.borderRadius = '50%';
                center.style.display = 'flex';
                center.style.alignItems = 'center';
                center.style.justifyContent = 'center';
                center.style.fontSize = '10px';
                center.style.fontWeight = 'bold';
                center.textContent = totalThreads;
                pieChart.appendChild(center);
            }
            
            states.forEach(state => {
                const count = stateCounts[state.name];
                if (count > 0) {
                    // Create summary item
                    const item = document.createElement('div');
                    item.className = 'state-summary-item';
                    
                    const label = document.createElement('div');
                    label.className = 'state-summary-label';
                    label.innerHTML = `<span class="state-summary-icon">${state.emoji}</span>${state.name}`;
                    
                    const countEl = document.createElement('div');
                    countEl.className = 'state-summary-count';
                    countEl.textContent = count;
                    
                    item.appendChild(label);
                    item.appendChild(countEl);
                    summaryContent.appendChild(item);
                    
                    // Create bar segment
                    const segment = document.createElement('div');
                    segment.className = 'state-bar-segment';
                    segment.style.backgroundColor = state.color;
                    segment.style.width = `${(count / totalThreads) * 100}%`;
                    summaryBar.appendChild(segment);
                }
            });
            
            // If no thread details available, show a message
            if (totalThreads === 0 || Object.values(stateCounts).every(count => count === 0)) {
                summaryContent.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 10px;">Thread state details not available</div>';
                summaryBar.style.display = 'none';
                pieChart.style.display = 'none';
            } else {
                summaryBar.style.display = 'flex';
                pieChart.style.display = 'block';
            }
        }

        function detectThreadState(thread) {
            if (!thread.stack || thread.stack.length === 0) return 'RUNNABLE';
            
            const stackTrace = thread.stack.join('\n').toLowerCase();
            
            if (stackTrace.includes('park') || stackTrace.includes('wait')) return 'WAITING';
            if (stackTrace.includes('sleep')) return 'SLEEPING';
            if (stackTrace.includes('monitor') && stackTrace.includes('blocked')) return 'BLOCKED';
            
            return 'RUNNABLE';
        }

        // Advanced Analysis Functions
        function runDeadlockDetection() {
            const deadlocks = detectDeadlocks();
            const alertsContainer = document.getElementById('analysisAlerts');
            
            alertsContainer.innerHTML = '';
            
            if (deadlocks.length > 0) {
                deadlocks.forEach((deadlock, index) => {
                    const alert = createAlert('critical', '⚠️', 'Potential Deadlock Detected', 
                        `${deadlock.threads.length} threads involved in circular wait`);
                    
                    const graph = document.createElement('div');
                    graph.className = 'deadlock-graph';
                    graph.innerHTML = deadlock.description;
                    alert.appendChild(graph);
                    
                    alertsContainer.appendChild(alert);
                });
            }
        }

        function detectDeadlocks() {
            const deadlocks = [];
            const threads = getAllThreads();
            const waitGraph = buildWaitGraph(threads);
            
            // Find cycles in wait graph (simplified deadlock detection)
            const visited = new Set();
            const recursionStack = new Set();
            
            function hasCycle(threadId, path = []) {
                if (recursionStack.has(threadId)) {
                    // Found cycle
                    const cycleStart = path.indexOf(threadId);
                    if (cycleStart !== -1) {
                        const cycle = path.slice(cycleStart);
                        cycle.push(threadId);
                        return cycle;
                    }
                }
                
                if (visited.has(threadId)) return null;
                
                visited.add(threadId);
                recursionStack.add(threadId);
                path.push(threadId);
                
                const dependencies = waitGraph.get(threadId) || [];
                for (const dep of dependencies) {
                    const cycle = hasCycle(dep, [...path]);
                    if (cycle) return cycle;
                }
                
                recursionStack.delete(threadId);
                path.pop();
                return null;
            }
            
            // Check each thread for cycles
            for (const thread of threads) {
                if (!visited.has(thread.tid)) {
                    const cycle = hasCycle(thread.tid);
                    if (cycle && cycle.length > 2) {
                        const cycleThreads = cycle.map(tid => 
                            threads.find(t => t.tid === tid)).filter(t => t);
                        
                        deadlocks.push({
                            threads: cycleThreads,
                            description: formatDeadlockDescription(cycleThreads)
                        });
                    }
                }
            }
            
            return deadlocks;
        }

        function buildWaitGraph(threads) {
            const waitGraph = new Map();
            
            threads.forEach(thread => {
                const dependencies = extractLockDependencies(thread);
                if (dependencies.length > 0) {
                    waitGraph.set(thread.tid, dependencies);
                }
            });
            
            return waitGraph;
        }

        function extractLockDependencies(thread) {
            const dependencies = [];
            if (!thread.stack) return dependencies;
            
            // Look for common lock patterns in stack traces
            const stackTrace = thread.stack.join('\n');
            
            // Look for java.util.concurrent locks
            const lockMatches = stackTrace.match(/java\.util\.concurrent\.locks\..*Lock\.lock/g);
            if (lockMatches) {
                // Simplified: assume dependency on other waiting threads
                const allThreads = getAllThreads();
                allThreads.forEach(otherThread => {
                    if (otherThread.tid !== thread.tid && 
                        detectThreadState(otherThread) === 'WAITING') {
                        dependencies.push(otherThread.tid);
                    }
                });
            }
            
            return dependencies;
        }

        function formatDeadlockDescription(threads) {
            let description = 'Deadlock cycle detected:\n';
            threads.forEach((thread, index) => {
                const nextIndex = (index + 1) % threads.length;
                const nextThread = threads[nextIndex];
                description += `Thread ${thread.tid} (${thread.name}) → waiting for Thread ${nextThread.tid} (${nextThread.name})\n`;
            });
            return description;
        }

        function runPerformanceAnalysis(stateCounts, totalThreads) {
            const analysis = analyzePerformance(stateCounts, totalThreads);
            updatePerformanceInsights(analysis);
        }

        function analyzePerformance(stateCounts, totalThreads) {
            const analysis = {
                metrics: [],
                recommendations: [],
                issues: []
            };
            
            // Thread state distribution analysis
            const waitingPercentage = (stateCounts.WAITING / totalThreads) * 100;
            const blockedPercentage = (stateCounts.BLOCKED / totalThreads) * 100;
            const runnablePercentage = (stateCounts.RUNNABLE / totalThreads) * 100;
            
            analysis.metrics.push({
                label: 'Waiting Threads',
                value: `${waitingPercentage.toFixed(1)}%`,
                level: waitingPercentage > 50 ? 'critical' : waitingPercentage > 30 ? 'warning' : 'good'
            });
            
            analysis.metrics.push({
                label: 'Blocked Threads',
                value: `${blockedPercentage.toFixed(1)}%`,
                level: blockedPercentage > 20 ? 'critical' : blockedPercentage > 10 ? 'warning' : 'good'
            });
            
            analysis.metrics.push({
                label: 'Active Threads',
                value: `${runnablePercentage.toFixed(1)}%`,
                level: runnablePercentage < 20 ? 'critical' : runnablePercentage < 40 ? 'warning' : 'good'
            });
            
            // Thread pool analysis
            const threadPools = analyzeThreadPools();
            analysis.metrics.push({
                label: 'Thread Pools',
                value: threadPools.count,
                level: threadPools.saturated > 0 ? 'warning' : 'good'
            });
            
            // Generate recommendations
            if (waitingPercentage > 50) {
                analysis.recommendations.push({
                    title: 'High Wait Ratio',
                    description: 'Over 50% of threads are waiting. Consider reviewing lock contention and I/O operations.'
                });
            }
            
            if (blockedPercentage > 20) {
                analysis.recommendations.push({
                    title: 'Thread Contention',
                    description: 'High percentage of blocked threads indicates lock contention. Review synchronization.'
                });
            }
            
            if (totalThreads > 200) {
                // Check if virtual threads are present
                const hasVirtualThreads = threads.some(thread => 
                    thread.threadName && thread.threadName.includes('VirtualThread') ||
                    thread.threadName && thread.threadName.startsWith('virtual-')
                );
                
                if (hasVirtualThreads) {
                    analysis.recommendations.push({
                        title: 'Virtual Thread Usage',
                        description: 'High virtual thread count detected. This is normal for virtual threads - they are lightweight and designed for high concurrency.'
                    });
                } else {
                    analysis.recommendations.push({
                        title: 'Platform Thread Count',
                        description: 'High platform thread count detected. Consider using thread pools, async processing, or migrating to virtual threads (Java 21+).'
                    });
                }
            }
            
            const stackDepthIssues = analyzeStackDepth();
            if (stackDepthIssues.count > 0) {
                analysis.recommendations.push({
                    title: 'Deep Stack Traces',
                    description: `${stackDepthIssues.count} threads have deep stack traces (>100 frames). Check for recursion or deep call chains.`
                });
            }
            
            return analysis;
        }

        function analyzeThreadPools() {
            const pools = new Set();
            const threads = getAllThreads();
            
            threads.forEach(thread => {
                if (thread.name.includes('pool') || thread.name.includes('worker')) {
                    const poolName = thread.name.split('-')[0];
                    pools.add(poolName);
                }
            });
            
            return {
                count: pools.size,
                saturated: 0 // Simplified - would need more analysis
            };
        }

        function analyzeStackDepth() {
            const threads = getAllThreads();
            let deepStackCount = 0;
            
            threads.forEach(thread => {
                if (thread.stack && thread.stack.length > 100) {
                    deepStackCount++;
                }
            });
            
            return { count: deepStackCount };
        }

        function getAllThreads() {
            const threads = [];
            if (!currentThreadDump) return threads;
            
            currentThreadDump.threadContainers.forEach(container => {
                if (container.threads) {
                    threads.push(...container.threads);
                }
            });
            
            return threads;
        }

        function updatePerformanceInsights(analysis) {
            const metricsContainer = document.getElementById('performanceMetrics');
            const recommendationsContainer = document.getElementById('recommendations');
            
            metricsContainer.innerHTML = '';
            recommendationsContainer.innerHTML = '';
            
            // Add metrics
            analysis.metrics.forEach(metric => {
                const metricEl = document.createElement('div');
                metricEl.className = 'insight-metric';
                metricEl.innerHTML = `
                    <span class="insight-label">${metric.label}</span>
                    <span class="insight-value ${metric.level}">${metric.value}</span>
                `;
                metricsContainer.appendChild(metricEl);
            });
            
            // Add recommendations
            analysis.recommendations.forEach(rec => {
                const recEl = document.createElement('div');
                recEl.className = 'recommendation';
                recEl.innerHTML = `
                    <div class="recommendation-title">${rec.title}</div>
                    <div>${rec.description}</div>
                `;
                recommendationsContainer.appendChild(recEl);
            });
        }

        function createAlert(type, icon, title, message) {
            const alert = document.createElement('div');
            alert.className = `alert alert-${type}`;
            
            alert.innerHTML = `
                <span class="alert-icon">${icon}</span>
                <div class="alert-content">
                    <div class="alert-title">${title}</div>
                    <div class="alert-details">${message}</div>
                </div>
            `;
            
            return alert;
        }

        function renderTree() {
            const treeView = document.getElementById('treeView');
            treeView.innerHTML = '';
            
            const containers = buildContainerTree(currentThreadDump.threadContainers);
            containers.forEach(container => {
                treeView.appendChild(renderContainer(container));
            });
        }

        function buildContainerTree(containers) {
            const containerMap = new Map();
            const rootContainers = [];
            
            containers.forEach(container => {
                containerMap.set(container.container, {
                    ...container,
                    children: []
                });
            });
            
            containers.forEach(container => {
                if (container.parent && containerMap.has(container.parent)) {
                    containerMap.get(container.parent).children.push(containerMap.get(container.container));
                } else {
                    rootContainers.push(containerMap.get(container.container));
                }
            });
            
            return rootContainers;
        }

        function renderContainer(container, level = 0) {
            const containerNode = document.createElement('div');
            containerNode.className = 'container-node';
            containerNode.style.marginLeft = `${level * 20}px`;
            containerNode.dataset.containerName = container.container;
            
            const header = document.createElement('div');
            header.className = 'container-header';
            header.onclick = () => toggleContainer(containerNode);
            
            const expandIcon = document.createElement('span');
            expandIcon.className = 'expand-icon';
            expandIcon.textContent = '▼';
            
            const containerName = document.createElement('span');
            containerName.className = 'container-name';
            containerName.textContent = `📦 ${container.container}`;
            
            const threadCount = document.createElement('span');
            threadCount.className = 'thread-count';
            threadCount.textContent = `(${container.threadCount || container.threads?.length || 0} threads)`;
            
            header.appendChild(expandIcon);
            header.appendChild(containerName);
            header.appendChild(threadCount);
            
            const threadList = document.createElement('div');
            threadList.className = 'thread-list';
            
            // Check if this container should be collapsed based on saved state
            if (!expandedContainers.has(container.container)) {
                threadList.classList.add('collapsed');
                expandIcon.classList.add('collapsed');
            }
            
            if (container.threads) {
                container.threads.forEach(thread => {
                    const threadEl = renderThread(thread);
                    if (threadEl) {
                        threadList.appendChild(threadEl);
                    }
                });
            }
            
            if (container.children) {
                container.children.forEach(child => {
                    threadList.appendChild(renderContainer(child, level + 1));
                });
            }
            
            containerNode.appendChild(header);
            containerNode.appendChild(threadList);
            
            return containerNode;
        }

        function renderThread(thread) {
            const state = detectThreadState(thread);
            
            if (!matchesFilters(thread, state)) {
                return null;
            }
            
            const threadItem = document.createElement('div');
            threadItem.className = 'thread-item';
            threadItem.onclick = () => toggleStackTrace(threadItem);
            
            const threadIcon = document.createElement('span');
            threadIcon.className = 'thread-icon';
            threadIcon.textContent = '🧵';
            
            const threadName = document.createElement('span');
            threadName.className = 'thread-name';
            threadName.innerHTML = highlightSearch(`#${thread.tid} ${thread.name}`);
            
            const threadState = document.createElement('span');
            threadState.className = `thread-state state-${state.toLowerCase()}`;
            threadState.textContent = state;
            
            threadItem.appendChild(threadIcon);
            threadItem.appendChild(threadName);
            threadItem.appendChild(threadState);
            
            if (thread.stack && thread.stack.length > 0) {
                const stackTrace = document.createElement('div');
                stackTrace.className = 'stack-trace';
                
                thread.stack.forEach(line => {
                    const stackLine = document.createElement('div');
                    stackLine.className = 'stack-line';
                    stackLine.textContent = line;
                    stackTrace.appendChild(stackLine);
                });
                
                threadItem.appendChild(stackTrace);
            }
            
            return threadItem;
        }

        function matchesFilters(thread, state) {
            const searchTerm = currentFilters.search.toLowerCase();
            if (searchTerm && !thread.name.toLowerCase().includes(searchTerm) && 
                !thread.tid.toString().includes(searchTerm)) {
                return false;
            }
            
            const stateFilter = currentFilters.states[state.toLowerCase()];
            if (stateFilter === false) {
                return false;
            }
            
            return true;
        }

        function highlightSearch(text) {
            if (!currentFilters.search) return text;
            
            const regex = new RegExp(`(${currentFilters.search})`, 'gi');
            return text.replace(regex, '<span class="highlight">$1</span>');
        }

        function toggleContainer(containerNode) {
            const expandIcon = containerNode.querySelector('.expand-icon');
            const threadList = containerNode.querySelector('.thread-list');
            const containerName = containerNode.dataset.containerName;
            
            if (threadList.classList.contains('collapsed')) {
                threadList.classList.remove('collapsed');
                expandIcon.classList.remove('collapsed');
                expandedContainers.add(containerName);
            } else {
                threadList.classList.add('collapsed');
                expandIcon.classList.add('collapsed');
                expandedContainers.delete(containerName);
            }
            
            saveExpandedState();
        }

        function toggleStackTrace(threadItem) {
            const stackTrace = threadItem.querySelector('.stack-trace');
            if (stackTrace) {
                stackTrace.classList.toggle('show');
            }
        }

        function expandAll() {
            document.querySelectorAll('.container-node').forEach(node => {
                const containerName = node.dataset.containerName;
                if (containerName) {
                    expandedContainers.add(containerName);
                }
            });
            
            document.querySelectorAll('.thread-list').forEach(list => {
                list.classList.remove('collapsed');
            });
            document.querySelectorAll('.expand-icon').forEach(icon => {
                icon.classList.remove('collapsed');
            });
            
            saveExpandedState();
        }

        function collapseAll() {
            expandedContainers.clear();
            
            document.querySelectorAll('.thread-list').forEach(list => {
                list.classList.add('collapsed');
            });
            document.querySelectorAll('.expand-icon').forEach(icon => {
                icon.classList.add('collapsed');
            });
            
            saveExpandedState();
        }

        function filterThreads() {
            currentFilters.search = document.getElementById('searchBox').value;
            currentFilters.states.waiting = document.getElementById('filterWaiting').checked;
            currentFilters.states.sleeping = document.getElementById('filterSleeping').checked;
            currentFilters.states.runnable = document.getElementById('filterRunnable').checked;
            currentFilters.states.blocked = document.getElementById('filterBlocked').checked;
            
            saveFilterSettings();
            renderTree();
        }

        function toggleExportMenu() {
            const dropdown = document.getElementById('exportDropdown');
            dropdown.classList.toggle('show');
        }

        function exportAsText() {
            let text = 'Thread Dump Analysis\n';
            text += '===================\n\n';
            text += `Process ID: ${currentThreadDump.processId}\n`;
            text += `Runtime: ${currentThreadDump.runtimeVersion}\n`;
            text += `Time: ${new Date(currentThreadDump.time).toLocaleString()}\n\n`;
            
            function addContainer(container, indent = '') {
                text += `${indent}📦 ${container.container} (${container.threadCount || container.threads?.length || 0} threads)\n`;
                
                if (container.threads) {
                    container.threads.forEach(thread => {
                        const state = detectThreadState(thread);
                        text += `${indent}  🧵 #${thread.tid} ${thread.name} [${state}]\n`;
                    });
                }
                
                if (container.children) {
                    container.children.forEach(child => {
                        addContainer(child, indent + '  ');
                    });
                }
            }
            
            const containers = buildContainerTree(currentThreadDump.threadContainers);
            containers.forEach(container => addContainer(container));
            
            navigator.clipboard.writeText(text);
            alert('Thread dump copied to clipboard!');
            toggleExportMenu();
        }

        function exportAsHTML() {
            const htmlContent = document.documentElement.outerHTML;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'thread-dump-analysis.html';
            a.click();
            URL.revokeObjectURL(url);
            toggleExportMenu();
        }

        function loadSampleData(event) {
            event.stopPropagation();
            
            // Check if we're in paste mode and should populate the textarea
            const pasteMethod = document.getElementById('pasteUploadMethod');
            const isInPasteMode = pasteMethod && pasteMethod.style.display !== 'none';
            
            const sampleData = {
                "threadDump": {
                    "processId": "10259",
                    "time": "2025-06-10T00:49:22.146091Z",
                    "runtimeVersion": "25-ea+25-3096",
                    "threadContainers": [
                        {
                            "container": "<root>",
                            "parent": null,
                            "owner": "3",
                            "threads": [
                                {
                                    "tid": "3",
                                    "name": "main",
                                    "stack": [
                                        "java.base/jdk.internal.misc.Unsafe.park(Native Method)",
                                        "java.base/java.util.concurrent.locks.LockSupport.park(LockSupport.java:221)",
                                        "java.base/java.util.concurrent.StructuredTaskScope.implJoin(StructuredTaskScope.java:752)",
                                        "java.base/java.util.concurrent.StructuredTaskScope.join(StructuredTaskScope.java:707)",
                                        "StructCon.fetch(StructCon.java:62)",
                                        "StructCon.main(StructCon.java:77)"
                                    ]
                                },
                                {
                                    "tid": "9",
                                    "name": "Reference Handler",
                                    "stack": [
                                        "java.base/java.lang.ref.Reference.waitForReferencePendingList(Native Method)",
                                        "java.base/java.lang.ref.Reference.processPendingReferences(Reference.java:246)",
                                        "java.base/java.lang.ref.Reference$ReferenceHandler.run(Reference.java:208)"
                                    ]
                                },
                                {
                                    "tid": "10",
                                    "name": "Finalizer",
                                    "stack": [
                                        "java.base/java.lang.Object.wait0(Native Method)",
                                        "java.base/java.lang.Object.wait(Object.java:375)",
                                        "java.base/java.lang.Object.wait(Object.java:348)",
                                        "java.base/java.lang.ref.NativeReferenceQueue.await(NativeReferenceQueue.java:48)",
                                        "java.base/java.lang.ref.ReferenceQueue.remove0(ReferenceQueue.java:155)",
                                        "java.base/java.lang.ref.NativeReferenceQueue.remove(NativeReferenceQueue.java:89)",
                                        "java.base/java.lang.ref.Finalizer$FinalizerThread.run(Finalizer.java:173)"
                                    ]
                                }
                            ],
                            "threadCount": "8"
                        },
                        {
                            "container": "doc-gathering-scope",
                            "parent": "<root>",
                            "owner": null,
                            "threads": [
                                {
                                    "tid": "26",
                                    "name": "doc-proc1",
                                    "stack": [
                                        "java.base/java.lang.Thread.sleep(Thread.java:574)",
                                        "StructCon.processDocument(StructCon.java:29)",
                                        "StructCon.lambda$fetch$0(StructCon.java:66)",
                                        "java.base/java.util.concurrent.StructuredTaskScope$SubtaskImpl.run(StructuredTaskScope.java:886)",
                                        "java.base/java.lang.VirtualThread.runContinuation(VirtualThread.java:248)",
                                        "java.base/java.lang.VirtualThread$$Lambda/0x00007f65bc003288.run(Unknown Source)",
                                        "java.base/java.util.concurrent.ForkJoinTask$RunnableExecuteAction.compute(ForkJoinTask.java:1726)",
                                        "java.base/java.util.concurrent.ForkJoinTask$InterruptibleTask.exec(ForkJoinTask.java:1663)",
                                        "java.base/java.util.concurrent.ForkJoinTask.doExec(ForkJoinTask.java:507)",
                                        "java.base/java.util.concurrent.ForkJoinPool$WorkQueue.topLevelExec(ForkJoinPool.java:1491)",
                                        "java.base/java.util.concurrent.ForkJoinPool.runWorker(ForkJoinPool.java:1948)",
                                        "java.base/java.util.concurrent.ForkJoinWorkerThread.run(ForkJoinWorkerThread.java:189)"
                                    ]
                                },
                                {
                                    "tid": "27",
                                    "name": "doc-proc2",
                                    "stack": [
                                        "java.base/java.lang.Thread.sleep(Thread.java:574)",
                                        "StructCon.processDocument(StructCon.java:29)",
                                        "StructCon.lambda$fetch$0(StructCon.java:66)",
                                        "java.base/java.util.concurrent.StructuredTaskScope$SubtaskImpl.run(StructuredTaskScope.java:886)",
                                        "java.base/java.lang.VirtualThread.runContinuation(VirtualThread.java:248)",
                                        "java.base/java.lang.VirtualThread$$Lambda/0x00007f65bc003288.run(Unknown Source)",
                                        "java.base/java.util.concurrent.ForkJoinTask$RunnableExecuteAction.compute(ForkJoinTask.java:1726)",
                                        "java.base/java.util.concurrent.ForkJoinTask$InterruptibleTask.exec(ForkJoinTask.java:1663)",
                                        "java.base/java.util.concurrent.ForkJoinTask.doExec(ForkJoinTask.java:507)",
                                        "java.base/java.util.concurrent.ForkJoinPool$WorkQueue.topLevelExec(ForkJoinPool.java:1491)",
                                        "java.base/java.util.concurrent.ForkJoinPool.runWorker(ForkJoinPool.java:1948)",
                                        "java.base/java.util.concurrent.ForkJoinWorkerThread.run(ForkJoinWorkerThread.java:189)"
                                    ]
                                },
                                {
                                    "tid": "28",
                                    "name": "doc-proc3",
                                    "stack": [
                                        "java.base/java.lang.Thread.sleep(Thread.java:574)",
                                        "StructCon.processDocument(StructCon.java:29)",
                                        "StructCon.lambda$fetch$0(StructCon.java:66)",
                                        "java.base/java.util.concurrent.StructuredTaskScope$SubtaskImpl.run(StructuredTaskScope.java:886)",
                                        "java.base/java.lang.VirtualThread.runContinuation(VirtualThread.java:248)",
                                        "java.base/java.lang.VirtualThread$$Lambda/0x00007f65bc003288.run(Unknown Source)",
                                        "java.base/java.util.concurrent.ForkJoinTask$RunnableExecuteAction.compute(ForkJoinTask.java:1726)",
                                        "java.base/java.util.concurrent.ForkJoinTask$InterruptibleTask.exec(ForkJoinTask.java:1663)",
                                        "java.base/java.util.concurrent.ForkJoinTask.doExec(ForkJoinTask.java:507)",
                                        "java.base/java.util.concurrent.ForkJoinPool$WorkQueue.topLevelExec(ForkJoinPool.java:1491)",
                                        "java.base/java.util.concurrent.ForkJoinPool.runWorker(ForkJoinPool.java:1948)",
                                        "java.base/java.util.concurrent.ForkJoinWorkerThread.run(ForkJoinWorkerThread.java:189)"
                                    ]
                                }
                            ],
                            "threadCount": "3"
                        }
                    ]
                }
            };
            
            if (isInPasteMode) {
                // Populate textarea with sample data
                const textArea = document.getElementById('jsonTextArea');
                textArea.value = JSON.stringify(sampleData, null, 2);
            } else {
                // Process sample data directly (file upload mode)
                showLoading('Loading sample data...');
                setTimeout(() => {
                    processThreadDump(sampleData);
                    hideLoading();
                }, 100);
            }
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + F - Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                const searchBox = document.getElementById('searchBox');
                if (searchBox && document.getElementById('analysisView').style.display !== 'none') {
                    searchBox.focus();
                    searchBox.select();
                }
            }
            
            // Escape - Close dropdowns, help, blur search, or go back
            if (e.key === 'Escape') {
                const exportDropdown = document.getElementById('exportDropdown');
                const helpOverlay = document.getElementById('helpOverlay');
                const analysisView = document.getElementById('analysisView');
                
                // Check if any overlays are open first
                if (exportDropdown && exportDropdown.classList.contains('show')) {
                    exportDropdown.classList.remove('show');
                } else if (helpOverlay && helpOverlay.style.display !== 'none') {
                    hideHelp();
                } else if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                    document.activeElement.blur();
                } else if (analysisView && analysisView.style.display !== 'none') {
                    goBackToUpload();
                }
            }
            
            // Ctrl/Cmd + E - Expand all
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                if (document.getElementById('analysisView').style.display !== 'none') {
                    expandAll();
                }
            }
            
            // Ctrl/Cmd + Shift + E - Collapse all
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                if (document.getElementById('analysisView').style.display !== 'none') {
                    collapseAll();
                }
            }
            
            // Ctrl/Cmd + O - Open file
            if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                e.preventDefault();
                document.getElementById('fileInput').click();
            }
            
            // Ctrl/Cmd + P - Print
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                if (document.getElementById('analysisView').style.display !== 'none') {
                    printView();
                }
            }
            
            // ? - Show help (when not in input)
            if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                showHelp();
            }
            
            // Ctrl/Cmd + V - Switch to paste mode when not already in textarea
            if ((e.ctrlKey || e.metaKey) && e.key === 'v' && document.activeElement.tagName !== 'TEXTAREA') {
                const uploadSection = document.getElementById('uploadSection');
                if (uploadSection && uploadSection.style.display !== 'none') {
                    e.preventDefault();
                    switchUploadMethod('paste');
                    setTimeout(() => {
                        document.getElementById('jsonTextArea').focus();
                    }, 100);
                }
            }
        });

        // Upload method switching
        function switchUploadMethod(method) {
            const tabs = document.querySelectorAll('.method-tab');
            const methods = document.querySelectorAll('.upload-method');
            
            // Update tab states
            tabs.forEach(tab => tab.classList.remove('active'));
            methods.forEach(methodEl => methodEl.style.display = 'none');
            
            // Show selected method
            if (method === 'file') {
                document.querySelector('.method-tab[onclick*="file"]').classList.add('active');
                document.getElementById('fileUploadMethod').style.display = 'block';
            } else if (method === 'paste') {
                document.querySelector('.method-tab[onclick*="paste"]').classList.add('active');
                document.getElementById('pasteUploadMethod').style.display = 'block';
            }
        }

        function processJsonFromTextArea() {
            const textArea = document.getElementById('jsonTextArea');
            const jsonContent = textArea.value.trim();
            
            if (!jsonContent) {
                showError('Please paste JSON content in the text area');
                return;
            }
            
            showLoading('Parsing JSON data...');
            
            try {
                const data = JSON.parse(jsonContent);
                updateLoadingText('Processing thread dump...');
                setTimeout(() => {
                    processThreadDump(data);
                    // Save to recent files with a generated name
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    addRecentFile(`pasted-dump-${timestamp}.json`, jsonContent);
                    hideLoading();
                }, 100);
            } catch (error) {
                hideLoading();
                showError('Invalid JSON format: ' + error.message);
            }
        }

        function clearTextArea() {
            document.getElementById('jsonTextArea').value = '';
        }

        // Navigation functions
        function goBackToUpload() {
            document.getElementById('analysisView').style.display = 'none';
            document.getElementById('uploadSection').style.display = 'block';
            
            // Clear current analysis data
            currentThreadDump = null;
            
            // Clear the tree view
            const treeView = document.getElementById('treeView');
            if (treeView) {
                treeView.innerHTML = '';
            }
        }

        // Initialize theme on load
        initTheme();

        // Close menus when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.export-menu')) {
                document.getElementById('exportDropdown').classList.remove('show');
            }
            if (!e.target.closest('.recent-files')) {
                document.getElementById('recentFilesDropdown').classList.remove('show');
            }
        });