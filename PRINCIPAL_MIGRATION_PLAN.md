# Principal Dashboard Migration Plan

## Current Status Analysis

### ✅ Compliant Pages (Keep & Enhance)
1. **home/** - Functional dashboard with stats, charts, and quick actions
   - Status: Complete ✓
   - Action: No changes needed

2. **people/** - Recently updated with functional user management  
   - Status: Functional ✓
   - Action: Verify consolidation is complete

### 🔧 Pages to Enhance (Consolidate Features)
3. **academic/** - Partially implemented
   - Status: Needs feature consolidation
   - Missing: Reports integration, full curriculum management
   - Action: Merge content from `assignments/` and `reports/`

4. **communication/** - Has placeholders
   - Status: Needs implementation
   - Missing: Messages, Events, Announcements
   - Action: Merge content from `messages/` and `events/`

5. **operations/** - Has placeholders  
   - Status: Needs implementation
   - Missing: Finance, Settings, Resources, Reports
   - Action: Merge content from `finance/`, `settings/`, and `reports/`

### 📦 Pages to Remove (Merge into Core 5)
6. **assignments/** - Placeholder → Merge into `academic/`
7. **events/** - Placeholder → Merge into `communication/`
8. **finance/** - Partial implementation → Merge into `operations/`
9. **messages/** - Placeholder → Merge into `communication/`
10. **reports/** - Placeholder → Merge into `operations/`
11. **settings/** - Placeholder → Merge into `operations/`

---

## Migration Steps

### Phase 1: Enhance Academic Page ✅

**File**: `src/app/dashboard/principal/academic/page.tsx`

**Current Features**:
- Classes management (view, create, edit)
- Subjects management
- Assignments overview
- Grade distribution
- Teacher assignments

**Add from assignments/**:
- Assignment creation wizard
- Assignment grading interface
- Submission tracking
- Assignment analytics

**Add from reports/**:
- Academic performance reports
- Grade distribution charts
- Student progress analytics
- Class performance comparison

**Implementation**:
```typescript
// Tab structure
<Tabs defaultValue="classes">
  <TabsList>
    <TabsTrigger value="classes">Classes & Subjects</TabsTrigger>
    <TabsTrigger value="assignments">Assignments</TabsTrigger>
    <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
    <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger>
  </TabsList>
  
  <TabsContent value="classes">
    {/* Class and Subject management */}
  </TabsContent>
  
  <TabsContent value="assignments">
    {/* Assignment oversight and management */}
  </TabsContent>
  
  <TabsContent value="curriculum">
    {/* Lesson plans, academic calendar */}
  </TabsContent>
  
  <TabsContent value="analytics">
    {/* Performance reports and analytics */}
  </TabsContent>
</Tabs>
```

---

### Phase 2: Enhance Communication Page

**File**: `src/app/dashboard/principal/communication/page.tsx`

**Add from messages/**:
- Messaging interface
- Conversation threads
- Message composition
- Staff/parent messaging

**Add from events/**:
- Event calendar
- Event creation/management
- Event attendance
- RSVP tracking

**New Features**:
- Announcement creation/management
- Notification center
- Broadcast messaging
- Communication templates

**Implementation**:
```typescript
// Tab structure
<Tabs defaultValue="messages">
  <TabsList>
    <TabsTrigger value="messages">Messages</TabsTrigger>
    <TabsTrigger value="announcements">Announcements</TabsTrigger>
    <TabsTrigger value="events">Events</TabsTrigger>
    <TabsTrigger value="notifications">Notifications</TabsTrigger>
  </TabsList>
  
  <TabsContent value="messages">
    {/* Messaging interface with conversations */}
  </TabsContent>
  
  <TabsContent value="announcements">
    {/* School-wide announcements management */}
  </TabsContent>
  
  <TabsContent value="events">
    {/* Event calendar and management */}
  </TabsContent>
  
  <TabsContent value="notifications">
    {/* Notification center and settings */}
  </TabsContent>
</Tabs>
```

---

### Phase 3: Enhance Operations Page

**File**: `src/app/dashboard/principal/operations/page.tsx`

**Add from finance/**:
- Fee collection overview
- Payment tracking
- Financial reports
- Invoice management

**Add from settings/**:
- School settings
- System configuration
- User permissions
- Academic year setup

**Add from reports/**:
- Attendance reports
- Financial reports
- System audit logs
- Data exports

**New Features**:
- Resource management (rooms, facilities)
- Attendance monitoring
- Compliance tracking

**Implementation**:
```typescript
// Tab structure
<Tabs defaultValue="finance">
  <TabsList>
    <TabsTrigger value="finance">Finance</TabsTrigger>
    <TabsTrigger value="attendance">Attendance</TabsTrigger>
    <TabsTrigger value="resources">Resources</TabsTrigger>
    <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  
  <TabsContent value="finance">
    {/* Financial management and fee tracking */}
  </TabsContent>
  
  <TabsContent value="attendance">
    {/* School-wide attendance monitoring */}
  </TabsContent>
  
  <TabsContent value="resources">
    {/* Room, facility, and resource management */}
  </TabsContent>
  
  <TabsContent value="reports">
    {/* Comprehensive reporting and analytics */}
  </TabsContent>
  
  <TabsContent value="settings">
    {/* School configuration and system settings */}
  </TabsContent>
</Tabs>
```

---

### Phase 4: Update Navigation

**File**: `src/components/app-sidebar.tsx` (or navigation config)

**Update Principal Navigation**:
```typescript
{
  title: "Principal",
  url: "#",
  icon: Home,
  items: [
    {
      title: "Dashboard",
      url: "/dashboard/principal/home",
      icon: BlocksIcon
    },
    {
      title: "Academic",
      url: "/dashboard/principal/academic",
      icon: BookOpen
    },
    {
      title: "People",
      url: "/dashboard/principal/people",
      icon: Users
    },
    {
      title: "Communication",
      url: "/dashboard/principal/communication",
      icon: MessageCircle
    },
    {
      title: "Operations",
      url: "/dashboard/principal/operations",
      icon: Settings
    }
  ]
}
```

**Remove old navigation items**:
- ❌ Assignments
- ❌ Events
- ❌ Finance
- ❌ Messages
- ❌ Reports
- ❌ Settings

---

### Phase 5: Cleanup Old Directories

**Directories to Remove**:
```bash
rm -rf src/app/dashboard/principal/assignments
rm -rf src/app/dashboard/principal/events
rm -rf src/app/dashboard/principal/finance
rm -rf src/app/dashboard/principal/messages
rm -rf src/app/dashboard/principal/reports
rm -rf src/app/dashboard/principal/settings
```

**Verification Checklist**:
- [ ] All features migrated to new pages
- [ ] No broken links in navigation
- [ ] No dead routes in codebase
- [ ] API routes updated if needed
- [ ] Tests updated
- [ ] Documentation updated

---

## Implementation Order

### Priority 1: Critical Functionality
1. ✅ Verify `home/` is untouched (per requirements)
2. ✅ Verify `people/` consolidation complete
3. 🔄 Enhance `communication/` with messages + events
4. 🔄 Enhance `operations/` with finance + settings + reports
5. 🔄 Enhance `academic/` with assignments + reports

### Priority 2: Navigation & Cleanup
6. Update sidebar navigation to show only 5 pages
7. Test all routes and functionality
8. Remove old placeholder directories
9. Update any hardcoded routes in components

### Priority 3: Polish & Documentation
10. Add breadcrumb navigation
11. Add search functionality per page
12. Optimize performance
13. Update user documentation

---

## Component Reusability Strategy

### Shared Components to Create/Reuse
- `MessageList` - For all messaging interfaces
- `EventCalendar` - For event management
- `DataTable` - For all list views
- `StatsCard` - For metrics display
- `ReportGenerator` - For all report pages
- `FilterBar` - For search/filter across pages

### Page-Specific Components
- `AcademicDashboard` - Classes, assignments, grades
- `CommunicationHub` - Messages, announcements, events
- `OperationsCenter` - Finance, attendance, settings

---

## Database Considerations

### Ensure API Routes Support:
- `/api/principal/academic/*` - Classes, subjects, assignments
- `/api/principal/communication/*` - Messages, events, announcements
- `/api/principal/operations/*` - Finance, attendance, reports
- `/api/principal/people/*` - Users, enrollment (already exists)

### Data Aggregation:
- Academic: Classes + Subjects + Assignments + Grades
- Communication: Messages + Conversations + Events + Announcements
- Operations: Fees + Attendance + Resources + Settings

---

## Testing Plan

### Unit Tests
- [ ] Component rendering
- [ ] Data fetching
- [ ] User interactions
- [ ] Form validations

### Integration Tests
- [ ] Page navigation
- [ ] Data persistence
- [ ] Role-based access
- [ ] API integration

### E2E Tests
- [ ] Complete user flows
- [ ] Cross-page functionality
- [ ] Mobile responsiveness
- [ ] Performance benchmarks

---

## Rollback Strategy

### If Issues Arise:
1. Keep old directories temporarily in a `_deprecated/` folder
2. Maintain feature flags for gradual rollout
3. Monitor error logs and user feedback
4. Have database backup before migration
5. Document all changes for quick reversal

---

## Success Metrics

### User Experience:
- ✅ Reduced clicks to reach any feature (max 2 clicks)
- ✅ Improved page load times (< 2s)
- ✅ Mobile usability score > 90%
- ✅ User satisfaction feedback

### Technical:
- ✅ Code reduction (fewer duplicate components)
- ✅ Improved maintainability
- ✅ Better test coverage (> 80%)
- ✅ Lighthouse score > 90

### Business:
- ✅ Faster user onboarding
- ✅ Reduced support tickets
- ✅ Increased feature discoverability
- ✅ Consistent UX across roles

---

**Status**: Ready for implementation
**Estimated Effort**: 2-3 development days
**Risk Level**: Low (phased approach with rollback plan)
**Dependencies**: None (people/ page already complete)

---

**Next Actions**:
1. Get approval for migration plan
2. Start with Communication page enhancement
3. Progress to Operations page enhancement
4. Update Academic page with consolidated features
5. Update navigation and remove old directories
