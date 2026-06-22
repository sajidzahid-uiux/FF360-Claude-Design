## [0.1.85](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.85...frontend-v0.1.85) (2026-06-10)

## [0.1.84](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.84...frontend-v0.1.84) (2026-06-10)

## [0.1.83](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.83...frontend-v0.1.83) (2026-06-10)

### Bug Fixes

- **contacts:** sub-contact unlinking is gated by write permission instead of delete in farm management contacts ([#2087](https://github.com/fieldflow360/management-system/issues/2087)) ([14a9b8a](https://github.com/fieldflow360/management-system/commit/14a9b8a203061877cc98a127c0acc41ee0ca1f68))

## [0.1.82](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.82...frontend-v0.1.82) (2026-06-10)

## [0.1.81](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.81...frontend-v0.1.81) (2026-06-09)

### Bug Fixes

- **subscribe:** fix type script errors in jsx elements ([#1187](https://github.com/fieldflow360/management-system/issues/1187)) ([#1188](https://github.com/fieldflow360/management-system/issues/1188)) ([8ce0311](https://github.com/fieldflow360/management-system/commit/8ce0311bec2ebe33ba4fe455181401b4234f1e02))
- **subscribe:** fix type script errors in jsx elements ([#1187](https://github.com/fieldflow360/management-system/issues/1187)) ([#1189](https://github.com/fieldflow360/management-system/issues/1189)) ([6949bb6](https://github.com/fieldflow360/management-system/commit/6949bb6864fbce2e8487269f21a04aee96dcbea6))

## [0.1.80](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.80...frontend-v0.1.80) (2026-06-09)

### Bug Fixes

- **equipment:** admin can read & write comments, user with no write can not post comments ([#2083](https://github.com/fieldflow360/management-system/issues/2083)) ([35b7753](https://github.com/fieldflow360/management-system/commit/35b775316cefd36a10ff6f465c8c539cda7d8359))

## [0.1.79](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.79...frontend-v0.1.79) (2026-06-09)

## [0.1.78](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.78...frontend-v0.1.78) (2026-06-09)

### Bug Fixes

- **jobs-leads:** switched from 'clients and farms' inline view in grid and kanban cards to compact view ([#2067](https://github.com/fieldflow360/management-system/issues/2067)) ([1fe0559](https://github.com/fieldflow360/management-system/commit/1fe055969c4cfb2ef8ed6fbf08d7a1c7dad19e77))

## [0.1.77](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.77...frontend-v0.1.77) (2026-06-09)

### Bug Fixes

- **activity-logs:** improve logging messages & enhance queries ([4e2f25b](https://github.com/fieldflow360/management-system/commit/4e2f25bf02b74d68317d73e402296df5da20178f))
- address copilot review comments ([500aeff](https://github.com/fieldflow360/management-system/commit/500aeff50cd2ac4834565e35aef17b6f05a58c9b))
- address copilot review comments ([3de8935](https://github.com/fieldflow360/management-system/commit/3de8935188df1e7af971c5a01e9d1f9eed99a406))
- addresscopilot review comments ([a658fef](https://github.com/fieldflow360/management-system/commit/a658fef9c3d04e449b8de1945cec38a3e80caeb5))
- **contact:** add vertical scrolling to create & link modal in farm management contact ([#2048](https://github.com/fieldflow360/management-system/issues/2048)) ([499a57b](https://github.com/fieldflow360/management-system/commit/499a57ba63d6d181b029e7d3bc3423d37a84d49e)), closes [#2051](https://github.com/fieldflow360/management-system/issues/2051) [#2053](https://github.com/fieldflow360/management-system/issues/2053) [#2056](https://github.com/fieldflow360/management-system/issues/2056) [#2058](https://github.com/fieldflow360/management-system/issues/2058) [#2059](https://github.com/fieldflow360/management-system/issues/2059) [#2060](https://github.com/fieldflow360/management-system/issues/2060)
- **contacts:** add farm management names and contacts ([d168f59](https://github.com/fieldflow360/management-system/commit/d168f5954c4a94cf58161e30c6ab62c8db71c5b9))
- **contacts:** add validation to ensure at least one contact is provided ([c4cc619](https://github.com/fieldflow360/management-system/commit/c4cc619469de25a04c6ad178344dbbcab803a38d))
- **contacts:** add validation to prevent sub-contacts from being linked to multiple Farm Management contacts ([b21aa4a](https://github.com/fieldflow360/management-system/commit/b21aa4a3b1238eff40f986641a6f6739b9399696))
- **contacts:** added missing description field & implemented contacts api to link sub contacts ([#1992](https://github.com/fieldflow360/management-system/issues/1992)) ([9732b90](https://github.com/fieldflow360/management-system/commit/9732b904aefc33b82cda68ff798c810f4df2a068)), closes [#1993](https://github.com/fieldflow360/management-system/issues/1993)
- **contacts:** invalidating sub-contacts query after standard contact delete ([#1999](https://github.com/fieldflow360/management-system/issues/1999)) ([0c770e9](https://github.com/fieldflow360/management-system/commit/0c770e9c5e00a3faf474107451b644808e3ff417)), closes [#2005](https://github.com/fieldflow360/management-system/issues/2005) [#2006](https://github.com/fieldflow360/management-system/issues/2006) [#2007](https://github.com/fieldflow360/management-system/issues/2007)
- **contacts:** remove farm_management_contacts from payload to enforce linking control ([abe6c1f](https://github.com/fieldflow360/management-system/commit/abe6c1f2c27e290d742efd961080c5cc8a9b34d3))
- **contacts:** remove unused variable assignment ([e8bd63e](https://github.com/fieldflow360/management-system/commit/e8bd63e36c47deec3edaf09b5452c1d21a72909c))
- include phone number in farm management contacts ([ef514aa](https://github.com/fieldflow360/management-system/commit/ef514aaba52f1b586dfb32393c45a0494e541cea))
- Issue of migration file ([ea750a0](https://github.com/fieldflow360/management-system/commit/ea750a015b57de845dd36674f451e0131f9e627e))
- **job_lead_stakeholders:** optimize retrieval of primary contact and farm IDs ([4155efc](https://github.com/fieldflow360/management-system/commit/4155efc5d2128cff3f56c8da3e6d83d110fb38ef))
- **job_lead_stakeholders:** preserve existing primary contact and farm on PATCH requests ([b117c81](https://github.com/fieldflow360/management-system/commit/b117c81fdd353417eb2255c10723ccc8b2658e4a))
- **jobs:** added trailer & vehicle equipment types to tiling job on-site tracking ([#1991](https://github.com/fieldflow360/management-system/issues/1991)) ([c3f13aa](https://github.com/fieldflow360/management-system/commit/c3f13aa8b04ec4cd35157e90680bd73cef0dea53))
- **leads:** enhance job data with full multi-client stakeholder information ([e0fe240](https://github.com/fieldflow360/management-system/commit/e0fe2405115d522ddcfd7f48596e85417ad26e3b))
- **maintenance:** invalidate equipment maintenance check on maintenance changes ([#1997](https://github.com/fieldflow360/management-system/issues/1997)) ([4059bb3](https://github.com/fieldflow360/management-system/commit/4059bb3cc11460dd33bc7452e10eb029da36761f))
- **map-data:** add all farms linked inside map-data endpoint ([483aa59](https://github.com/fieldflow360/management-system/commit/483aa59acc2bd0c255be5153d8ba46373a5b6b82))
- **migrations:** add symmetrical=False to farm_management_contacts field in contact model ([bae3c3d](https://github.com/fieldflow360/management-system/commit/bae3c3d01151d87901bc657f3b36331a80ba2b46))
- **models, serializers, views:** define max sub-contacts limit and update related checks ([afb976f](https://github.com/fieldflow360/management-system/commit/afb976f13ae7018ff8969639910cddbabdd40362))
- **on-site tracking:** removed report breakdown badges from on-site tracking equipment assignment ([#2033](https://github.com/fieldflow360/management-system/issues/2033)) ([2a0ef7a](https://github.com/fieldflow360/management-system/commit/2a0ef7ad7f5c904e7d13eb7ac234cff5daa3f146))
- restore and update migration files for contact entry and contact subtype ([dbf2571](https://github.com/fieldflow360/management-system/commit/dbf25719310f284cb3208ca7a177810f35fccf92))
- **serializers:** add contact_ids validation ([162665c](https://github.com/fieldflow360/management-system/commit/162665cf870bf65ba8f4d619f94eaf6549e98d0e))
- **serializers:** enforce 'Client Contact' category and limit sub-contacts to 10 per parent ([432b24c](https://github.com/fieldflow360/management-system/commit/432b24cdf3c6fe8204dee64d7bc70a5f418051f8))
- **serializers:** ensure unique parent IDs for farm management contacts validation ([08c8ddd](https://github.com/fieldflow360/management-system/commit/08c8dddd2ba70b1f04d85e9af1dd78284324276b))
- **serializers:** manage patch request for sub_contacts ([24b4880](https://github.com/fieldflow360/management-system/commit/24b488018721bcb11c285c064844d312d2084e14))
- **serializers:** prevent conversion to Farm Management contact if linked to farms, jobs, or leads ([2319d49](https://github.com/fieldflow360/management-system/commit/2319d4941ff9bc311e2535307f129d6d45569e26))
- **serializers:** prevent self-linking of contacts in ContactV2Serializer ([072813f](https://github.com/fieldflow360/management-system/commit/072813f28535a7fc7c4547bc842bf997a7e1c3b3))
- **serializers:** restrict changing contact subtype after creation ([9bdd9ec](https://github.com/fieldflow360/management-system/commit/9bdd9ec59a6f01199fab493838a5ddd4199ab598))
- **serializers:** sort farm management contacts by ID in ContactInfoMixin and InvoiceSerializer ([cf7bad4](https://github.com/fieldflow360/management-system/commit/cf7bad43149f3fc61b0eb7376af8a22e3dc51ece))
- **showmorecard:** allow special file deletion for repair & excavation job types ([#2012](https://github.com/fieldflow360/management-system/issues/2012)) ([4d27194](https://github.com/fieldflow360/management-system/commit/4d27194299bb56be5777afa9d088190cff775c7e)), closes [#2015](https://github.com/fieldflow360/management-system/issues/2015)
- **stakeholders:** ensure all contacts are validated when farm_ids change without contact_ids ([e663903](https://github.com/fieldflow360/management-system/commit/e663903e117d6047af3614e12d11365059bc05fe))
- **stakeholders:** handle orphaned farms when contact_ids change without farm_ids ([da3e412](https://github.com/fieldflow360/management-system/commit/da3e4123b93ca7df041517664e526cdd2108ca59))
- **stakeholders:** preserve farm_ids when primary_contact_id changes ([89c03d2](https://github.com/fieldflow360/management-system/commit/89c03d28110aefd77acc94585bf4ac4a567ef109))
- **stakeholders:** update validation logic for farm_ids and primary_farm_id changes without contact_ids ([3a56485](https://github.com/fieldflow360/management-system/commit/3a564852cc3b4ee24c1e8fddad07acb46bfa06f2))
- **tests:** update assertions in build_contact_read_dict test for farm management contacts ([9ee1359](https://github.com/fieldflow360/management-system/commit/9ee13597a08ddfc21d6fbe2b11856bfeb4989983))
- update serializer usage in FarmManagementSubContactViewSet for sub-contact creation ([d8a3001](https://github.com/fieldflow360/management-system/commit/d8a30014d7e5d7f7d9101a84cb787d76553d2f3a))
- **views:** add filtering by contact subtype in ContactV2ViewSet ([b67001c](https://github.com/fieldflow360/management-system/commit/b67001c2b346d04b0ca08b4ba159c885c1923750))
- **views:** enhance ContactV2ViewSet queryset to include farm management contacts and sub-contacts ([444a828](https://github.com/fieldflow360/management-system/commit/444a82859949aa7314cf5c6fbd9def8f0e393993))
- **views:** validate parent contact type in FarmManagementSubContactViewSet ([24de9e2](https://github.com/fieldflow360/management-system/commit/24de9e2c553e7a364bbfe5866e0f8aee903e76a2))

### Features

- **activity-logs:** enhance logging for contact and farm relationship changes in lead and job updates ([9b69573](https://github.com/fieldflow360/management-system/commit/9b695737a3e9a8805cd52b1443699e0aba0a4763))
- add farm management filtering to job and lead viewsets ([bf51aee](https://github.com/fieldflow360/management-system/commit/bf51aee57f6cb77a6844e9c387bbe569a5b0fecc))
- **completed-cancelled:** enabled comments for co&ca page with correct permissions ([#1946](https://github.com/fieldflow360/management-system/issues/1946)) ([2d85068](https://github.com/fieldflow360/management-system/commit/2d85068abeacf5d19728da6aa1b7f70ee2567fb3))
- **contact:** add contact subtype and farm management relationships ([27326fc](https://github.com/fieldflow360/management-system/commit/27326fc615aa1b1e5a75229cc3d55dae2d299026))
- **contact:** implement dual-mode M2M link field for farm management and sub-contacts ([6af72c5](https://github.com/fieldflow360/management-system/commit/6af72c5f908449c342eb4083a7a21c8a9235669a))
- **contacts:** add filter for unlinked standard contacts in ContactV2ViewSet ([7ae9256](https://github.com/fieldflow360/management-system/commit/7ae9256fbf43a9cf0069be5611ac1ce29230b049))
- **contacts:** add home phone number filtering in contact search ([1ceffaf](https://github.com/fieldflow360/management-system/commit/1ceffaf50d362dfd0e0efa22e7752d714c74dd2e))
- **contacts:** add sub-contact API, hooks, and contact details lib helpers ([#1972](https://github.com/fieldflow360/management-system/issues/1972)) ([83cdafc](https://github.com/fieldflow360/management-system/commit/83cdafc51fbbb3b557800d9a1268753909210e35)), closes [#1973](https://github.com/fieldflow360/management-system/issues/1973)
- **contacts:** enhance filtering for subcontacts ([c177d46](https://github.com/fieldflow360/management-system/commit/c177d46f6060906199aad81f99c7f53ad8bcdfb1))
- **contacts:** filter standard contacts not linked to Farm Management contacts ([cb47102](https://github.com/fieldflow360/management-system/commit/cb47102bb2a2b194426419b787223f68ee80eded))
- **contacts:** include farm management names in contact read dictionary ([c2667d1](https://github.com/fieldflow360/management-system/commit/c2667d17a95cfe135317273236ba2f1e56fc893f))
- **contacts:** support multiple names and phone numbers per contact ([7f1e8fb](https://github.com/fieldflow360/management-system/commit/7f1e8fb164e032d571238bac9da024b0aeb7daf7))
- **dashboard:** add farm management contacts to dashboard designs ([a1aea40](https://github.com/fieldflow360/management-system/commit/a1aea401ec94830653e843c029e072a79be73a22))
- enhance deletion logic in ContactV2ViewSet to prevent removal of Farm Management contacts with linked sub-contacts ([994e739](https://github.com/fieldflow360/management-system/commit/994e739613fd8d4f6b1be5ab0b7717d0255c3804))
- **farms:** enhance contact filtering to support multiple contact IDs in RecordFarmListViewSet ([e1cc308](https://github.com/fieldflow360/management-system/commit/e1cc308703f6fd1fb722de1968699fab68cdd2aa))
- improve deletion logic in ContactV2ViewSet to handle Farm Management contacts with sub-contact dependencies ([70d5c7b](https://github.com/fieldflow360/management-system/commit/70d5c7bd1fbb7e602a4336ebc2a6b0c0b3613f31))
- **jobs:** add multi-client and multi-farm create flows ([#2022](https://github.com/fieldflow360/management-system/issues/2022)) ([b211480](https://github.com/fieldflow360/management-system/commit/b211480366ddd5fdc507e69d24cb43e7d048f41b)), closes [#2023](https://github.com/fieldflow360/management-system/issues/2023) [#2024](https://github.com/fieldflow360/management-system/issues/2024)
- **jobs:** add on-hold tab to jobs module ([9e403d4](https://github.com/fieldflow360/management-system/commit/9e403d4e00edbb91919e8447b2caf1fceed5ae50))
- **Leads, Jobs:** implemented Farm Contact Visibility in leads and jobs list,grid, & kanban views ([#1982](https://github.com/fieldflow360/management-system/issues/1982)) ([67d41b0](https://github.com/fieldflow360/management-system/commit/67d41b0fd6aa3ba16486919c85c599c1ed9d387d))
- **map-data:** include farm management details ([d6447fd](https://github.com/fieldflow360/management-system/commit/d6447fd57e14a8bf7781abd9665d5029e0a26e0f))
- **maps-orderpipemaps:** multi farm display on map page and order pipe page ([#2029](https://github.com/fieldflow360/management-system/issues/2029)) ([d335507](https://github.com/fieldflow360/management-system/commit/d3355070d8e887b621cf4bacb377bdce68b5da22)), closes [#2030](https://github.com/fieldflow360/management-system/issues/2030) [#2031](https://github.com/fieldflow360/management-system/issues/2031) [#2032](https://github.com/fieldflow360/management-system/issues/2032)
- **notes:** add section access control and on-site notes wiring ([bdadd12](https://github.com/fieldflow360/management-system/commit/bdadd12b758c8ba23436c9302e63dcb0f4c116b1))
- **permission-map:** add retrieve and create_and_link permissions for FarmManagementSubContactViewSet ([1f005ba](https://github.com/fieldflow360/management-system/commit/1f005ba15675a2dcc8e1a548d1f9b75c3a0b5335))
- **serializers:** add validation to prevent assigning leads to farm management contacts ([d3e9d78](https://github.com/fieldflow360/management-system/commit/d3e9d781f3d2678ac0d8f6f0d3b0005cd5239da0))
- **serializers:** enhance contact validation for job assignments ([1c0ae81](https://github.com/fieldflow360/management-system/commit/1c0ae819205d8da6835de98c22254fed52af248b))
- **sub-contacts:** implement FarmManagementSubContactViewSet and related serializers ([9224117](https://github.com/fieldflow360/management-system/commit/922411779888b7fd3a8bc0e4707009fd3238e631))
- **tests:** add tests for farm management contacts in job details and contact read dict ([b1bb468](https://github.com/fieldflow360/management-system/commit/b1bb46885bb7bdc52654803a5b4a6a2e97ef4348))
- **tiling:** show vehicles and trailers on tiling job equipment list ([ef6e998](https://github.com/fieldflow360/management-system/commit/ef6e9984d3a30dfe34fab6b97d11c5e7f13524e6))
- update comment hooks to fetch and deduplicate comments across multiple note sections ([#1996](https://github.com/fieldflow360/management-system/issues/1996)) ([625f5f9](https://github.com/fieldflow360/management-system/commit/625f5f94c7b8254ab6d5039b95237a60ee042975))
- **vendor:** include farm management names in vendor contact details ([0381092](https://github.com/fieldflow360/management-system/commit/0381092464c6e76e6099644bfaa7f00831e62207))

## [0.1.76](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.76...frontend-v0.1.76) (2026-05-21)

### Bug Fixes

- **TeamMembers:** removed deleted team members from installed footage filter and convert lead to job designer dropdowns ([#1962](https://github.com/fieldflow360/management-system/issues/1962)) ([1a1a83c](https://github.com/fieldflow360/management-system/commit/1a1a83c68e05faade2225d739aa777c4573b252f)), closes [#1964](https://github.com/fieldflow360/management-system/issues/1964)

## [0.1.75](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.75...frontend-v0.1.75) (2026-05-20)

## [0.1.74](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.74...frontend-v0.1.74) (2026-05-20)

### Bug Fixes

- **installed-footage:** implemented new CrewGroups filter api for users with not crew permissions ([#1957](https://github.com/fieldflow360/management-system/issues/1957)) ([34593b8](https://github.com/fieldflow360/management-system/commit/34593b818622f97628c344b85c01170f79220c08))

## [0.1.73](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.73...frontend-v0.1.73) (2026-05-20)

### Features

- **team:** handle removed members in Team page and member dropdowns ([9f26764](https://github.com/fieldflow360/management-system/commit/9f26764b79ff17ee73f57a4de1ca06d6ad0bc48e))

## [0.1.72](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.72...frontend-v0.1.72) (2026-05-20)

### Features

- **crew-management:** add CrewGroupListSerializer and CrewGroupListViewSet for listing active crew groups without permissions ([7bba4cf](https://github.com/fieldflow360/management-system/commit/7bba4cf6a54065a9be2adbfd1ed37e5cfb917dca))

## [0.1.71](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.71...frontend-v0.1.71) (2026-05-19)

## [0.1.70](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.70...frontend-v0.1.70) (2026-05-19)

## [0.1.69](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.69...frontend-v0.1.69) (2026-05-18)

## [0.1.68](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.68...frontend-v0.1.68) (2026-05-18)

### Bug Fixes

- **calendar:** allow horizontal scroll for item card badges ([14280d6](https://github.com/fieldflow360/management-system/commit/14280d60c41d835e3b4961ccc0c3998b7cf0ac2e))
- **calendar:** click-drag scroll for hidden badges on item card ([91131d1](https://github.com/fieldflow360/management-system/commit/91131d17f879e6f7a3acc77a48fff22478195886))
- **calendar:** cover the full end day in timeline bars ([f61595d](https://github.com/fieldflow360/management-system/commit/f61595d662b4013987dfe8342b94923b8c92eb4e))
- **calendar:** drop description and duplicate farm name in details ([ed440d5](https://github.com/fieldflow360/management-system/commit/ed440d5339b023530eef7c10a418f131f8017db0))
- **calendar:** enlarge timeline item cards for readability ([1d9692b](https://github.com/fieldflow360/management-system/commit/1d9692b5ac09a46921af6105ee8595db5d33489e))
- **calendar:** expand DateField click target and guard TimelineFrame empty grid ([9df581e](https://github.com/fieldflow360/management-system/commit/9df581ef0f2e803e996e919d9f3f46c3f03c6531))
- **calendar:** group Job Status and Project Type filters by category ([7d8d723](https://github.com/fieldflow360/management-system/commit/7d8d72330c5ffda02ea052ecefa55365bf034f34))
- **calendar:** hide edit schedule on completed items ([5c042b2](https://github.com/fieldflow360/management-system/commit/5c042b23329b7a5f34a6b4796e97eb3648f17a3b))
- **calendar:** hide items in grid cells outside the active month ([ae1f72d](https://github.com/fieldflow360/management-system/commit/ae1f72d0d1fc466929e54adcfe834cb39f39d25c))
- **calendar:** hide This Month button when current range is active ([4233569](https://github.com/fieldflow360/management-system/commit/4233569388925e097bcbf41a3c8494ed6e7f344e))
- **calendar:** include Tile in category filter placeholder label ([0030c10](https://github.com/fieldflow360/management-system/commit/0030c10a9d658b54ea0cfae3365eb1294652d9a9))
- **calendar:** keep days header pinned while scrolling ([ff68ec5](https://github.com/fieldflow360/management-system/commit/ff68ec52c67ac0fe7cd9234badeaa53dfb6c7b24))
- **calendar:** make tab counter text theme-aware ([c390917](https://github.com/fieldflow360/management-system/commit/c39091711ad0c688f9a71907c3817d2a6d5d1283))
- **calendar:** persist filters across navigation and reload ([5f30d0b](https://github.com/fieldflow360/management-system/commit/5f30d0b869c1f1d49efa235639fa536e1c8da9fb))
- **calendar:** persist selected month across navigation ([0763783](https://github.com/fieldflow360/management-system/commit/076378361c0c1b18e3a655c6c4e3e487ce46cf01))
- **calendar:** persist view mode and scale across navigation ([9155173](https://github.com/fieldflow360/management-system/commit/9155173782de9b60f564848ab74d3855f5a2cd53))
- **calendar:** refresh data automatically after creating a job or lead ([e83c625](https://github.com/fieldflow360/management-system/commit/e83c6255bd5385102ad60cc968ba81273e02e2de))
- **calendar:** refresh on job and lead updates ([b2adcda](https://github.com/fieldflow360/management-system/commit/b2adcda4dbeeb003f8701ce22f87b44411126612))
- **calendar:** refresh status on job updates ([#1917](https://github.com/fieldflow360/management-system/issues/1917)) ([fee4312](https://github.com/fieldflow360/management-system/commit/fee43128e3d7223726c1814585450c22463eeae7))
- **calendar:** remove unused three-dot menu from header ([ec58a35](https://github.com/fieldflow360/management-system/commit/ec58a35ec069cf225fc3fa9cb64d8bac09af39d4))
- **calendar:** render full item details in grid more popup ([4ec0e8e](https://github.com/fieldflow360/management-system/commit/4ec0e8e5348c4e009879afc9159c1444d2177cb9))
- **calendar:** show all month days in grid mode while scrolling ([05722ca](https://github.com/fieldflow360/management-system/commit/05722cac7616980601bc7db97fc050128859c584))
- **calendar:** show contact and farm name in day items popover ([5f046b4](https://github.com/fieldflow360/management-system/commit/5f046b46ec0788dbd368571ffea24003d699e66c))
- **calendar:** show contact and farm name in grid mode chips ([22e85ee](https://github.com/fieldflow360/management-system/commit/22e85ee092fbeb42e400aba90e271f0d6d1aa31d))
- **calendar:** show farm name in schedule details panel ([4056367](https://github.com/fieldflow360/management-system/commit/40563673bd6043f7e26a9b84f1b2003150d863dc))
- **calendar:** show grid chip arrow only on continuation days ([1090409](https://github.com/fieldflow360/management-system/commit/109040918a337856fbef059821167369f0d63c5a))
- **calendar:** show project type and lead source badges on lead cards ([a8c2683](https://github.com/fieldflow360/management-system/commit/a8c26835dba825fa82363c7dddf470bc102c2359))
- **calendar:** use backend status color for workflow pills ([3c99a22](https://github.com/fieldflow360/management-system/commit/3c99a22217e5a07462e03ae5d3ea04f833fe7a3e))
- **calendar:** use system accent color for buttons and filter UI ([5c90c38](https://github.com/fieldflow360/management-system/commit/5c90c380232ed0765ec735c9e3737b92bd8adc04))
- **calendar:** use system accent color for filter borders and highlights ([3214ffb](https://github.com/fieldflow360/management-system/commit/3214ffb3ce1d6ac2c371de160a3e3a9b50cb25b6))
- **completed-cancelled-jobs:** implemented completed_page_write permissiosn check on scheduling items ([#1911](https://github.com/fieldflow360/management-system/issues/1911)) ([8bb5850](https://github.com/fieldflow360/management-system/commit/8bb5850970791b7d5ba8a4c989196f2738f71035)), closes [#1915](https://github.com/fieldflow360/management-system/issues/1915)
- **jobs:** resolved stale data display issue ([#1839](https://github.com/fieldflow360/management-system/issues/1839)) ([2036a66](https://github.com/fieldflow360/management-system/commit/2036a66a0a9356519a5a2a9783e7aa69885ba561)), closes [#1840](https://github.com/fieldflow360/management-system/issues/1840) [#1841](https://github.com/fieldflow360/management-system/issues/1841) [#1842](https://github.com/fieldflow360/management-system/issues/1842)
- **jobs:** resolved type issue causing builderror ([#1844](https://github.com/fieldflow360/management-system/issues/1844)) ([7027521](https://github.com/fieldflow360/management-system/commit/70275217dc2a4eb216ade9f2b93e50d67bc299ee))
- **leads:** removed repairjob read permissions check from more actions dropdown in leads ([#1848](https://github.com/fieldflow360/management-system/issues/1848)) ([ceb9c26](https://github.com/fieldflow360/management-system/commit/ceb9c268e31ca8d5f1bfd91dbe4c7130007bdffb)), closes [#1849](https://github.com/fieldflow360/management-system/issues/1849) [#1850](https://github.com/fieldflow360/management-system/issues/1850) [#1851](https://github.com/fieldflow360/management-system/issues/1851)
- **map:** reduce cluster pin circle size ([53ef889](https://github.com/fieldflow360/management-system/commit/53ef8891636bf36ac6932747a750b55c104b637b))
- **orgDropDown:** added select button safety net to prevent accidental org select in mobile view ([#1824](https://github.com/fieldflow360/management-system/issues/1824)) ([87bbd66](https://github.com/fieldflow360/management-system/commit/87bbd66dfce688c06614d9b16516c46a9919a804)), closes [#1825](https://github.com/fieldflow360/management-system/issues/1825)
- **scheduling:** ensure completed jobs without schedule are not counted under completed ([03d60f4](https://github.com/fieldflow360/management-system/commit/03d60f44e1a2004691087ed62b8437b1652e24f3))
- **scheduling:** prevent schedule updates for completed jobs ([b23910f](https://github.com/fieldflow360/management-system/commit/b23910f71a2cb01305be62568aa39c949340c003))
- **scheduling:** refresh item from database after saving ([ac99070](https://github.com/fieldflow360/management-system/commit/ac9907050278f1dfcf1b3e2e67d8dfc2cb6b1096))
- **scheduling:** update jobs queryset to include only active jobs ([34d7bb2](https://github.com/fieldflow360/management-system/commit/34d7bb24a64b29897e8996702cb076816021b63b))
- **scheduling:** update lead filtering; optimize pagination ([fea9539](https://github.com/fieldflow360/management-system/commit/fea9539077f6da52ef5868f8d700c5e77f0ba574))
- **showmorecard:** clarify farm vs lead/job acre labels and disallow negative job lead acre ([#1809](https://github.com/fieldflow360/management-system/issues/1809)) ([0851929](https://github.com/fieldflow360/management-system/commit/08519292258cd6704e83ef343a75ca40737eae39)), closes [#1814](https://github.com/fieldflow360/management-system/issues/1814) [#1815](https://github.com/fieldflow360/management-system/issues/1815)
- **showmorecard:** fix estimate & contract buttons behavior and location ([#1816](https://github.com/fieldflow360/management-system/issues/1816)) ([45ae934](https://github.com/fieldflow360/management-system/commit/45ae9349c1d63d0795072a907f602ec206bda3db)), closes [#1817](https://github.com/fieldflow360/management-system/issues/1817) [#1818](https://github.com/fieldflow360/management-system/issues/1818) [#1819](https://github.com/fieldflow360/management-system/issues/1819)
- **task-management:** implemented fallback for assignee ids of removed team members ([#1918](https://github.com/fieldflow360/management-system/issues/1918)) ([44c6402](https://github.com/fieldflow360/management-system/commit/44c6402617d5122dec7a3262ca248c287e910cd0))
- **team:** implemented designer & operator badges for teammembers in team page ([#1899](https://github.com/fieldflow360/management-system/issues/1899)) ([56cd616](https://github.com/fieldflow360/management-system/commit/56cd6167831cbf69bbd975e5ab5e26d48ad479b6)), closes [#1900](https://github.com/fieldflow360/management-system/issues/1900) [#1905](https://github.com/fieldflow360/management-system/issues/1905) [#1907](https://github.com/fieldflow360/management-system/issues/1907)

### Features

- **calendar:** add loading skeletons for board, stats, and timelines ([53b2012](https://github.com/fieldflow360/management-system/commit/53b201292adfae00bf250278c9b01b32a60a4989))
- **calendar:** add responsive layouts across board, popovers, and form fields ([43d4a38](https://github.com/fieldflow360/management-system/commit/43d4a385a33d678b99e3963df9d51b9826129f43))
- **calendar:** build calendar feature with hooks-based architecture and grouped ui ([4dd16f9](https://github.com/fieldflow360/management-system/commit/4dd16f95b256936726e6246418f2cb4c35fcd1a7))
- **calendar:** implemented project type badge for jobs ([#1859](https://github.com/fieldflow360/management-system/issues/1859)) ([57b4f3f](https://github.com/fieldflow360/management-system/commit/57b4f3f4756f4f779968665056cb1f57e1f8c385)), closes [#1860](https://github.com/fieldflow360/management-system/issues/1860)
- **calendar:** implemented rbac permisssions on calendar items ([#1857](https://github.com/fieldflow360/management-system/issues/1857)) ([6a4061d](https://github.com/fieldflow360/management-system/commit/6a4061d71fe05c5ac6ff70a6a9de65f7e88a6368))
- **calendar:** wire scheduling APIs and replace mock data with live fetch ([c27179a](https://github.com/fieldflow360/management-system/commit/c27179a90143ea1c9cbad7694c23ce0355e21a85))
- **installed footage:** implemented crew column filtering ([#1788](https://github.com/fieldflow360/management-system/issues/1788)) ([193b0b9](https://github.com/fieldflow360/management-system/commit/193b0b910da8e9a55736ee4ab674d7bbd1cda520)), closes [#1792](https://github.com/fieldflow360/management-system/issues/1792) [#1794](https://github.com/fieldflow360/management-system/issues/1794) [#1796](https://github.com/fieldflow360/management-system/issues/1796) [#1797](https://github.com/fieldflow360/management-system/issues/1797)
- **jobs:** add permission check for updating scheduling fields of completed tiling jobs ([7dd7183](https://github.com/fieldflow360/management-system/commit/7dd7183186ba1d2c06e082d4939c1fe84a4eb3f4))
- **map:** implemented filter by project type ([#1798](https://github.com/fieldflow360/management-system/issues/1798)) ([738f95e](https://github.com/fieldflow360/management-system/commit/738f95ee0852d774eb973445c23a01373d77a52c)), closes [#1799](https://github.com/fieldflow360/management-system/issues/1799) [#1801](https://github.com/fieldflow360/management-system/issues/1801) [#1802](https://github.com/fieldflow360/management-system/issues/1802)
- **map:** viewport-bounded fetch and supercluster pin clustering ([29d94e4](https://github.com/fieldflow360/management-system/commit/29d94e4159867b5deca1aef3667b79c71a9596f8))
- **permissions:** add permission check for editing scheduling fields of completed jobs ([78f8811](https://github.com/fieldflow360/management-system/commit/78f8811122a0cfabc69a7dfbe25ac9e6efbf1cfb))
- **schedule:** allow editing of scheduling-related fields with job status completed ([d6f4830](https://github.com/fieldflow360/management-system/commit/d6f483029456d1c27daa7562e0eb740f4b5072e7))
- **scheduling:** add 'not_started' status for jobs and update statistics view ([831b362](https://github.com/fieldflow360/management-system/commit/831b36204121d55171c21ca2de61a63ad467c3c2))
- **scheduling:** add calendar status field and update job filtering logic ([196bb86](https://github.com/fieldflow360/management-system/commit/196bb86a1a915d0262539b3932da891097887046))
- **scheduling:** add scheduling statistics and item management endpoints (jobs-leads) ([58b3b2c](https://github.com/fieldflow360/management-system/commit/58b3b2c74cde3ec3513b92506764c03eb1bf3fb5))
- **scheduling:** add total leads count to scheduling statistics ([c5260e5](https://github.com/fieldflow360/management-system/commit/c5260e5bee89013614be2f9c06d7bf306ca9b72f))
- **scheduling:** enhance filtering options for scheduling items ([6e99537](https://github.com/fieldflow360/management-system/commit/6e995378de376c0278fd62db94b06c805c6fc068))
- **scheduling:** require entity_type parameter for item retrieval in SchedulingItemDetailView ([c114e33](https://github.com/fieldflow360/management-system/commit/c114e33f0c26f4fc98a1fd1aaed4cac47339c168))
- **todo-list:** implemented multiple assignee selection in task form and table ([#1806](https://github.com/fieldflow360/management-system/issues/1806)) ([b66f78d](https://github.com/fieldflow360/management-system/commit/b66f78d795f5068541809dd6c882c38dbf8df095)), closes [#1807](https://github.com/fieldflow360/management-system/issues/1807)

### Performance Improvements

- **consts:** centralized hardcoded values ([#1804](https://github.com/fieldflow360/management-system/issues/1804)) ([4ae695a](https://github.com/fieldflow360/management-system/commit/4ae695a3445296446a41280e44022d3093c68d9a))
- **map:** migrate map rendering from DOM markers to deck.gl WebGL ([6bb3e86](https://github.com/fieldflow360/management-system/commit/6bb3e865276f2548a1e5eeabb3d47e59e62878f7))
- **map:** optimize polygon rendering and prevent deck.gl rerenders ([#1836](https://github.com/fieldflow360/management-system/issues/1836)) ([4b04ce0](https://github.com/fieldflow360/management-system/commit/4b04ce0c87f93a800e05a7f44f9a7bd5cccbddcc)), closes [#1837](https://github.com/fieldflow360/management-system/issues/1837)

## [0.1.67](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.67...frontend-v0.1.67) (2026-04-23)

## [0.1.66](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.66...frontend-v0.1.66) (2026-04-23)

### Features

- **files:** impelemented xml & shp file upload for repair & excavation entries ([#1786](https://github.com/fieldflow360/management-system/issues/1786)) ([d24c91a](https://github.com/fieldflow360/management-system/commit/d24c91a2e87820cf13694d087a163087cafb8100)), closes [#1787](https://github.com/fieldflow360/management-system/issues/1787)

## [0.1.65](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.65...frontend-v0.1.65) (2026-04-21)

### Bug Fixes

- **log:** implemented correct route when redirecting user from completed logs ([#1778](https://github.com/fieldflow360/management-system/issues/1778)) ([21bb5da](https://github.com/fieldflow360/management-system/commit/21bb5da5bcaa2df547c861783ea8223a5727362e))

## [0.1.64](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.64...frontend-v0.1.64) (2026-04-21)

## [0.1.63](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.63...frontend-v0.1.63) (2026-04-21)

## [0.1.62](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.62...frontend-v0.1.62) (2026-04-21)

### Bug Fixes

- **ui:** resolved responsive issues reported in team & onsite-tracking pages ([#1776](https://github.com/fieldflow360/management-system/issues/1776)) ([c91ee26](https://github.com/fieldflow360/management-system/commit/c91ee2629ccd680a4d87ea55df63f75e4bcd0bc2))

## [0.1.61](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.61...frontend-v0.1.61) (2026-04-20)

## [0.1.60](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.60...frontend-v0.1.60) (2026-04-17)

## [0.1.59](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.59...frontend-v0.1.59) (2026-04-17)

### Bug Fixes

- **completed&cancelled:** replaced module param in end-point. using "coca" instead of "jobs" ([#1768](https://github.com/fieldflow360/management-system/issues/1768)) ([e31ede6](https://github.com/fieldflow360/management-system/commit/e31ede68bca4e7e8a45fdab0ac09b8374c13988b)), closes [#1771](https://github.com/fieldflow360/management-system/issues/1771)
- **dashboard:** fixed archive and Co&Ca issues with designs table ([#1772](https://github.com/fieldflow360/management-system/issues/1772)) ([dfd28c0](https://github.com/fieldflow360/management-system/commit/dfd28c01d3ca46bad81f14b2a7b07824c7f02a8b))
- **jobs:** added orgId to redirect after trash ([#1703](https://github.com/fieldflow360/management-system/issues/1703)) ([fef70ff](https://github.com/fieldflow360/management-system/commit/fef70ffde08927d1b0ee835f01d85c9fee8fc27e)), closes [#1704](https://github.com/fieldflow360/management-system/issues/1704)
- **logs:** fixed orderpipe, Equipment , & Contact UI issues ([#1756](https://github.com/fieldflow360/management-system/issues/1756)) ([ef35ef7](https://github.com/fieldflow360/management-system/commit/ef35ef7f1d737467a3e774e01fc0562aaa6ecfee))
- **logs:** added logs item in more actions drop down in view details card ([#1749](https://github.com/fieldflow360/management-system/issues/1749)) ([23dbe4f](https://github.com/fieldflow360/management-system/commit/23dbe4f18fd3598233715619d746b53d3a9ab583)), closes [#1750](https://github.com/fieldflow360/management-system/issues/1750) [#1752](https://github.com/fieldflow360/management-system/issues/1752)
- **onsite-tracking:** displayed all logs through popup ([#1762](https://github.com/fieldflow360/management-system/issues/1762)) ([0718c94](https://github.com/fieldflow360/management-system/commit/0718c94fe5bda1385dd1e0a2adb6c0b9d430ef8b))
- **project-type:** removed duplicate api end-point request ([#1733](https://github.com/fieldflow360/management-system/issues/1733)) ([2aeaad8](https://github.com/fieldflow360/management-system/commit/2aeaad8f87fc90d36f96d87b562a43200bf94d3f))

### Features

- **boundary-map:** implemented pin mode for lead and job items ([#1712](https://github.com/fieldflow360/management-system/issues/1712)) ([c5196b3](https://github.com/fieldflow360/management-system/commit/c5196b32236abfb49813ae4363f54bb97582b2f0))
- **dashboard-table:** implemented redirect for lead & job items in the designs table ([#1763](https://github.com/fieldflow360/management-system/issues/1763)) ([eef1a3c](https://github.com/fieldflow360/management-system/commit/eef1a3c99829840508dc20f58fd127e201e03256)), closes [#1766](https://github.com/fieldflow360/management-system/issues/1766)
- **dashboard:** redirect to lead/job source when table item clicked ([#1674](https://github.com/fieldflow360/management-system/issues/1674)) ([715838b](https://github.com/fieldflow360/management-system/commit/715838ba8206083d3e05a23505c9e9edf073831e)), closes [#1675](https://github.com/fieldflow360/management-system/issues/1675) [#1678](https://github.com/fieldflow360/management-system/issues/1678) [#1679](https://github.com/fieldflow360/management-system/issues/1679) [#1680](https://github.com/fieldflow360/management-system/issues/1680)
- **equipment:** integrated logs to api end-point ([#1737](https://github.com/fieldflow360/management-system/issues/1737)) ([ea93281](https://github.com/fieldflow360/management-system/commit/ea9328147843dca1541164eed336895264bbef21)), closes [#1738](https://github.com/fieldflow360/management-system/issues/1738) [#1739](https://github.com/fieldflow360/management-system/issues/1739) [#1740](https://github.com/fieldflow360/management-system/issues/1740) [#1741](https://github.com/fieldflow360/management-system/issues/1741)
- **installed footage:** implement dual wall and single wall types in onsite tracking and installed footage page ([#1709](https://github.com/fieldflow360/management-system/issues/1709)) ([135f2fe](https://github.com/fieldflow360/management-system/commit/135f2fe94ff7cc50cb3b157c6b8bdc4eb4eddd6f))
- **leads:** implemented logs with mock data ([#1724](https://github.com/fieldflow360/management-system/issues/1724)) ([2b018e6](https://github.com/fieldflow360/management-system/commit/2b018e6c0459bcdf9c0be56dd484c7739c039e68)), closes [#1725](https://github.com/fieldflow360/management-system/issues/1725) [#1726](https://github.com/fieldflow360/management-system/issues/1726) [#1727](https://github.com/fieldflow360/management-system/issues/1727) [#1729](https://github.com/fieldflow360/management-system/issues/1729) [#1731](https://github.com/fieldflow360/management-system/issues/1731)
- **map:** implemented pagination controls ([#1743](https://github.com/fieldflow360/management-system/issues/1743)) ([f5419d9](https://github.com/fieldflow360/management-system/commit/f5419d9bc16de7f7ea0885f76091d47d89454ff3)), closes [#1746](https://github.com/fieldflow360/management-system/issues/1746) [#1747](https://github.com/fieldflow360/management-system/issues/1747)
- **onsite-tracking:** integrated installed hours logs to backend api end-point ([#1736](https://github.com/fieldflow360/management-system/issues/1736)) ([4864ca2](https://github.com/fieldflow360/management-system/commit/4864ca2d95bb0eec4c8902137a211538227d740a)), closes [#1735](https://github.com/fieldflow360/management-system/issues/1735)

### Reverts

- Revert "laraib- added fixes for pipe type and sub type for order pipe" ([2688f98](https://github.com/fieldflow360/management-system/commit/2688f985d86ca9c466648bfa664d0697cf3163bc))

## [0.1.58](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.58...frontend-v0.1.58) (2026-03-31)

### Bug Fixes

- **order-pipe:** use item codes directly instead of category name mapping, fix option unit and refresh issues ([#1706](https://github.com/fieldflow360/management-system/issues/1706)) ([9a6d4ee](https://github.com/fieldflow360/management-system/commit/9a6d4ee02c5dd8a52f35070152bddafcb9f96e3b))

## [0.1.57](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.57...frontend-v0.1.57) (2026-03-25)

### Features

- **crew group:** remove inactive user from crew card ([#1693](https://github.com/fieldflow360/management-system/issues/1693)) ([d1dda66](https://github.com/fieldflow360/management-system/commit/d1dda662083f78d7f3d588d3a173c127653f9572))

## [0.1.56](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.56...frontend-v0.1.56) (2026-03-25)

## [0.1.55](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.55...frontend-v0.1.55) (2026-03-25)

## [0.1.54](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.54...frontend-v0.1.54) (2026-03-24)

## [0.1.53](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.53...frontend-v0.1.53) (2026-03-24)

## [0.1.52](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.52...frontend-v0.1.52) (2026-03-24)

## [0.1.51](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.51...frontend-v0.1.51) (2026-03-24)

## [0.1.50](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.50...frontend-v0.1.50) (2026-03-23)

### Bug Fixes

- **ci:** update Stripe publishable key reference to use secrets in CI/CD workflow ([c8a75b2](https://github.com/fieldflow360/management-system/commit/c8a75b2e9eb1d95145a1effc01b899822e29f022))
- **crew-dialog:** added a dropdown for each toggle ([#1633](https://github.com/fieldflow360/management-system/issues/1633)) ([26f273f](https://github.com/fieldflow360/management-system/commit/26f273f87905da01c401c133826188c834dea76c))
- **dashboard:** load dashboard data after org sign-in without refresh ([#1635](https://github.com/fieldflow360/management-system/issues/1635)) ([aeae395](https://github.com/fieldflow360/management-system/commit/aeae3959fe53c1fe3e3752894f8348400e57e2f3))
- **media-viewer:** enabled page navigation for pdf files ([#1623](https://github.com/fieldflow360/management-system/issues/1623)) ([7e93ac1](https://github.com/fieldflow360/management-system/commit/7e93ac1e0333679c2df937aac9c5cdf0ba7697e9)), closes [#1624](https://github.com/fieldflow360/management-system/issues/1624) [#1626](https://github.com/fieldflow360/management-system/issues/1626)
- **notifications:** implemented fallback logic when redirecting to completed jobs from notification page ([#1651](https://github.com/fieldflow360/management-system/issues/1651)) ([6e1d74b](https://github.com/fieldflow360/management-system/commit/6e1d74bfd909c5f595ccb421fc9a7b63643bd1cc)), closes [#1652](https://github.com/fieldflow360/management-system/issues/1652) [#1653](https://github.com/fieldflow360/management-system/issues/1653) [#1654](https://github.com/fieldflow360/management-system/issues/1654)
- **production-tracking:** navigat user outside after removing his own assignment ([#1648](https://github.com/fieldflow360/management-system/issues/1648)) ([ede4cab](https://github.com/fieldflow360/management-system/commit/ede4cabccae0ff4358c8172d749f5460d8345291)), closes [#1649](https://github.com/fieldflow360/management-system/issues/1649)
- **production-tracking:** redirecting back to main page after assignm… ([#1656](https://github.com/fieldflow360/management-system/issues/1656)) ([c848595](https://github.com/fieldflow360/management-system/commit/c8485950041e76a3367efee5aeb4953549ef09a8)), closes [#1657](https://github.com/fieldflow360/management-system/issues/1657)
- **quickactions:** removed acerage field from convert to modal ([#1570](https://github.com/fieldflow360/management-system/issues/1570)) ([3069f97](https://github.com/fieldflow360/management-system/commit/3069f97bf9b0307f4300b43fff0ea360e91825fe))
- **ResourceErrorView:** redirecting back to notifications ([#1650](https://github.com/fieldflow360/management-system/issues/1650)) ([a3dbe94](https://github.com/fieldflow360/management-system/commit/a3dbe94f58e9905b29146a4da57c2dacfdf9689c))
- **role-access:** displayed permissions list to match all role tab in team page ([#1583](https://github.com/fieldflow360/management-system/issues/1583)) ([13e72da](https://github.com/fieldflow360/management-system/commit/13e72dac3512946873550f7f15858a377533ccd9))
- **security:** renamed recent activity to login activity ([#1572](https://github.com/fieldflow360/management-system/issues/1572)) ([65e9e54](https://github.com/fieldflow360/management-system/commit/65e9e543fc3822e4213c675253191c9ebcdc3f10)), closes [#1573](https://github.com/fieldflow360/management-system/issues/1573) [#1574](https://github.com/fieldflow360/management-system/issues/1574) [#1575](https://github.com/fieldflow360/management-system/issues/1575) [#1576](https://github.com/fieldflow360/management-system/issues/1576) [#1577](https://github.com/fieldflow360/management-system/issues/1577) [#1578](https://github.com/fieldflow360/management-system/issues/1578) [#1579](https://github.com/fieldflow360/management-system/issues/1579)
- **subscription:** redirecting to subscription for orgs with no sub ([#1613](https://github.com/fieldflow360/management-system/issues/1613)) ([2a448c9](https://github.com/fieldflow360/management-system/commit/2a448c9890ff8e6586b66d4d69ba38263a450cc2)), closes [#1614](https://github.com/fieldflow360/management-system/issues/1614) [#1615](https://github.com/fieldflow360/management-system/issues/1615) [#1616](https://github.com/fieldflow360/management-system/issues/1616) [#1619](https://github.com/fieldflow360/management-system/issues/1619)
- **system:** eleminated infinite loop ([#1634](https://github.com/fieldflow360/management-system/issues/1634)) ([6bfe075](https://github.com/fieldflow360/management-system/commit/6bfe07522c162bff53bcd234d38998b8064e6eb4))
- **team:** resolved client side tab content crash ([#1607](https://github.com/fieldflow360/management-system/issues/1607)) ([1efc741](https://github.com/fieldflow360/management-system/commit/1efc741ffa79b54b7bb71de390633baeec895a7e)), closes [#1608](https://github.com/fieldflow360/management-system/issues/1608) [#1609](https://github.com/fieldflow360/management-system/issues/1609) [#1610](https://github.com/fieldflow360/management-system/issues/1610) [#1611](https://github.com/fieldflow360/management-system/issues/1611)

### Features

- **crewmanagement:** required project types in job creation & adjusted crew-management project type modification ([#1595](https://github.com/fieldflow360/management-system/issues/1595)) ([f6f96da](https://github.com/fieldflow360/management-system/commit/f6f96da2df087ffdbc9c726a43bff0dbb997f6c7)), closes [#1596](https://github.com/fieldflow360/management-system/issues/1596) [#1597](https://github.com/fieldflow360/management-system/issues/1597) [#1598](https://github.com/fieldflow360/management-system/issues/1598)
- **form:** implement react 19 example to create role and add to maintanence forms ([#1586](https://github.com/fieldflow360/management-system/issues/1586)) ([54e7b90](https://github.com/fieldflow360/management-system/commit/54e7b90d0e92970a1c433e71c92ef6a2e3e82a3f))
- **jobs:** implemented required changes to map & job hooks & UI to implement assigned-to feature ([#1629](https://github.com/fieldflow360/management-system/issues/1629)) ([defdf30](https://github.com/fieldflow360/management-system/commit/defdf30ff0d2bf39ba307a7ecbde5dd1ae3a04d8)), closes [#1630](https://github.com/fieldflow360/management-system/issues/1630) [#1631](https://github.com/fieldflow360/management-system/issues/1631)
- **notifications:** smart push suppression when active on web ([#1605](https://github.com/fieldflow360/management-system/issues/1605)) ([c29fb46](https://github.com/fieldflow360/management-system/commit/c29fb46371e29a507a9e748ac60635a14aaa6bcd)), closes [#1599](https://github.com/fieldflow360/management-system/issues/1599) [#1600](https://github.com/fieldflow360/management-system/issues/1600) [#1601](https://github.com/fieldflow360/management-system/issues/1601) [#1602](https://github.com/fieldflow360/management-system/issues/1602) [#1603](https://github.com/fieldflow360/management-system/issues/1603) [#1604](https://github.com/fieldflow360/management-system/issues/1604)
- **security:** manage device sessions ([#1565](https://github.com/fieldflow360/management-system/issues/1565)) ([a1b68af](https://github.com/fieldflow360/management-system/commit/a1b68afe756a5608f7a77dd147cddb23eb509cea)), closes [#1566](https://github.com/fieldflow360/management-system/issues/1566) [#1567](https://github.com/fieldflow360/management-system/issues/1567)
- **security:** change password with email verification ([#1563](https://github.com/fieldflow360/management-system/issues/1563)) ([e5e51de](https://github.com/fieldflow360/management-system/commit/e5e51dec4928e42d99316de53bde3265b2451805)), closes [#1564](https://github.com/fieldflow360/management-system/issues/1564)
- **shared ui:** tabs switcher ([#1571](https://github.com/fieldflow360/management-system/issues/1571)) ([2f76c9d](https://github.com/fieldflow360/management-system/commit/2f76c9db7158737edc2c4181d6d69cff6d6f6721))
- **userpreferences:** integrated backend to user preferences page ([#1588](https://github.com/fieldflow360/management-system/issues/1588)) ([30349a3](https://github.com/fieldflow360/management-system/commit/30349a30b7744ee6c9f6ec75df9541fc742e7c89)), closes [#1589](https://github.com/fieldflow360/management-system/issues/1589) [#1590](https://github.com/fieldflow360/management-system/issues/1590) [#1591](https://github.com/fieldflow360/management-system/issues/1591) [#1592](https://github.com/fieldflow360/management-system/issues/1592)

## [0.1.49](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.49...frontend-v0.1.49) (2026-03-04)

## [0.1.48](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.48...frontend-v0.1.48) (2026-03-04)

## [0.1.47](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.47...frontend-v0.1.47) (2026-03-04)

## [0.1.46](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.46...frontend-v0.1.46) (2026-03-04)

## [0.1.45](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.45...frontend-v0.1.45) (2026-03-04)

## [0.1.44](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.44...frontend-v0.1.44) (2026-03-03)

### Bug Fixes

- **BookKeeping:** displayed farm name along with contact name ([#1479](https://github.com/fieldflow360/management-system/issues/1479)) ([6b544b4](https://github.com/fieldflow360/management-system/commit/6b544b4849fb32d2679fbd765b780f15fb133ae2))
- **Build:** fix de-duplicate handle delete and params ([#1450](https://github.com/fieldflow360/management-system/issues/1450)) ([948cd51](https://github.com/fieldflow360/management-system/commit/948cd510d401bcb929feb21aff70de0559aa3b34))
- change filter from vendor_status to order_status ([68de84b](https://github.com/fieldflow360/management-system/commit/68de84b34004fc568955562510df612dae9e2b6b))
- **CI/CD workflows:** update Amplify deployment branch handling in new-dev-cicd.yml ([b4f9aa8](https://github.com/fieldflow360/management-system/commit/b4f9aa80f5ae94ff5177d0d90e0de69d272f83d4))
- **CI/CD workflows:** update environment and branch names in new-dev-cicd.yml ([b1b1273](https://github.com/fieldflow360/management-system/commit/b1b1273d9157915cec5a3249581766007639512b))
- conflict issues ([0af5a4c](https://github.com/fieldflow360/management-system/commit/0af5a4cbe51ea6bac3d75e308dd1ab3ab0e24079))
- **contact page:** remove duplicate sorting from the contact page ([#1407](https://github.com/fieldflow360/management-system/issues/1407)) ([1babe17](https://github.com/fieldflow360/management-system/commit/1babe1764be522fb2e23f7336bddaa8f57edf733))
- **contactfarms:** adjusted add/edit farm layout for easier boundary drawing ([#1495](https://github.com/fieldflow360/management-system/issues/1495)) ([04c4cae](https://github.com/fieldflow360/management-system/commit/04c4cae6b8e87fac873c212931276c052075fd71))
- **Dashboard:** added missing farm name with contact name ([#1480](https://github.com/fieldflow360/management-system/issues/1480)) ([c704af7](https://github.com/fieldflow360/management-system/commit/c704af76a789a2b2b812b64574a081f02fec92b7))
- **Favorite Vendors:** changed position for My Location button ([#1476](https://github.com/fieldflow360/management-system/issues/1476)) ([e025a54](https://github.com/fieldflow360/management-system/commit/e025a541aa398d88f87231c26d3043a97557770f))
- **FavoriteVendors:** added confimation popup,legend, and moved page to sidebar under settings ([#1417](https://github.com/fieldflow360/management-system/issues/1417)) ([bd91543](https://github.com/fieldflow360/management-system/commit/bd915437cf98263127213057d4ae1284b69ef2fa)), closes [#1419](https://github.com/fieldflow360/management-system/issues/1419)
- fix imports ([b64a617](https://github.com/fieldflow360/management-system/commit/b64a617d6a26fc66a3e4b4e1020ef329443d8149))
- **forms:** added add farm button when no farms available ([#1445](https://github.com/fieldflow360/management-system/issues/1445)) ([9095288](https://github.com/fieldflow360/management-system/commit/9095288dbdc6156a3e93cb3dea8a7be11dec9cf7)), closes [#1446](https://github.com/fieldflow360/management-system/issues/1446) [#1447](https://github.com/fieldflow360/management-system/issues/1447)
- **Order Page:** items displaying after navigating back from step 2 to step 1 ([#1532](https://github.com/fieldflow360/management-system/issues/1532)) ([858ecab](https://github.com/fieldflow360/management-system/commit/858ecab869e19e187d08be807414389adeb36fe4))
- **Order Pipe:** added delete option in all steps for order pipe ([#1437](https://github.com/fieldflow360/management-system/issues/1437)) ([67fc5c3](https://github.com/fieldflow360/management-system/commit/67fc5c3591a9c3acfb7cdf8bd85d16b0f60364cf))
- **Order Pipe:** adjusted on-site tracking maintenance unit for vehicle filters ([#1464](https://github.com/fieldflow360/management-system/issues/1464)) ([1b8c8e6](https://github.com/fieldflow360/management-system/commit/1b8c8e69079fc956fa63e650faaff0c34bd8da9f))
- **Order Pipe:** disable select button for read-only users in vendor popup ([#1482](https://github.com/fieldflow360/management-system/issues/1482)) ([056c26f](https://github.com/fieldflow360/management-system/commit/056c26f70e2b72c7fb0e54497d0a8a94a8cf643e))
- **Order Pipe:** displayed vendor and delivery locations on step 4 ([#1473](https://github.com/fieldflow360/management-system/issues/1473)) ([863dcf6](https://github.com/fieldflow360/management-system/commit/863dcf678e42fe24c48c7a9b957d9f251b7ac186))
- **Order Pipe:** displayed vendor location on step 3 ([#1467](https://github.com/fieldflow360/management-system/issues/1467)) ([635d309](https://github.com/fieldflow360/management-system/commit/635d3099eb7aaf894890cec9b3a220d02fca3cf2))
- **Order Pipe:** favorite vendors tile is not clickable without settings permission ([#1501](https://github.com/fieldflow360/management-system/issues/1501)) ([c4eaf94](https://github.com/fieldflow360/management-system/commit/c4eaf94057353ef0cadd2cbccc0fd067642417d5))
- **Order Pipe:** make order steps to use the api data rather then mock data ([#1453](https://github.com/fieldflow360/management-system/issues/1453)) ([803bbdf](https://github.com/fieldflow360/management-system/commit/803bbdfbf6079ae2b07f348d94991ee4441952dd))
- **Order Pipe:** persist modal step state across reopen ([#1465](https://github.com/fieldflow360/management-system/issues/1465)) ([b443800](https://github.com/fieldflow360/management-system/commit/b443800bcc3c3c594d59f03bfd3070f236846c85))
- **Order Pipe:** pipe drop location to show location + sequence ([#1463](https://github.com/fieldflow360/management-system/issues/1463)) ([d385553](https://github.com/fieldflow360/management-system/commit/d3855535811aede3475f1760be532d890b1182df))
- **Order Pipe:** preserve category/type on refresh on step 2 ([#1475](https://github.com/fieldflow360/management-system/issues/1475)) ([a16e798](https://github.com/fieldflow360/management-system/commit/a16e79847c1d9902974e2e6ad90a1c5f31edd9a3))
- **Order Pipe:** remove selected vendor (x) for read-only users in Step 1 ([#1481](https://github.com/fieldflow360/management-system/issues/1481)) ([fe7050c](https://github.com/fieldflow360/management-system/commit/fe7050ce39583a11bc548937efc21a987a189ad4))
- **Order Pipe:** show order name instead of order id on delete ([#1457](https://github.com/fieldflow360/management-system/issues/1457)) ([23b429a](https://github.com/fieldflow360/management-system/commit/23b429aea3c2911c324c09ca3c935635605313f0))
- **Order Pipe:** update accessiblity of favorite vendors list for read-only users on step 1 ([#1483](https://github.com/fieldflow360/management-system/issues/1483)) ([66452ca](https://github.com/fieldflow360/management-system/commit/66452ca65868a50f358e784757ece4857a355f31))
- **Order Pipe:** update location model for read-only users on step 3 ([#1485](https://github.com/fieldflow360/management-system/issues/1485)) ([5a99545](https://github.com/fieldflow360/management-system/commit/5a995459fd9958d4d7da89c4fdf35bd945f3b35a))
- **Order Pipe:** update order pipe navigation & content ([#1459](https://github.com/fieldflow360/management-system/issues/1459)) ([54107f9](https://github.com/fieldflow360/management-system/commit/54107f9b3de134e4cd37b21b56b07e10683230ad))
- **Order Pipe:** update the order fields for read-only users in step 2 ([#1484](https://github.com/fieldflow360/management-system/issues/1484)) ([19448d3](https://github.com/fieldflow360/management-system/commit/19448d3f5274143379aa1cd98a7fac14123e12dd))
- **Order Pipe:** update the order status dropdown for read-only users on step 4 ([#1486](https://github.com/fieldflow360/management-system/issues/1486)) ([637c5a3](https://github.com/fieldflow360/management-system/commit/637c5a37efddfa528d506579a28fe894c235bf3d))
- **Order Pipe:** vendor location mapped on step 3 ([#1477](https://github.com/fieldflow360/management-system/issues/1477)) ([863b96e](https://github.com/fieldflow360/management-system/commit/863b96e5c35f4c5c290411c0f93d908ebef4a2c9))
- **Order Pipe:** view details action in order pipe grid view ([#1503](https://github.com/fieldflow360/management-system/issues/1503)) ([5cc51cc](https://github.com/fieldflow360/management-system/commit/5cc51cc6a726ef2b5acdb660485cd70548f29ba1))
- **orderpipe:** implemented correct permissions for order pipe action in more actions tiling job ([#1531](https://github.com/fieldflow360/management-system/issues/1531)) ([52d8425](https://github.com/fieldflow360/management-system/commit/52d8425a93538e3a6980cba17a77c0a30701ea93))
- **orderpipe:** implemented ui fixes to orderpipe details page ([#1423](https://github.com/fieldflow360/management-system/issues/1423)) ([d253d69](https://github.com/fieldflow360/management-system/commit/d253d69df8d6073a80df69cd1b7e71532b5a304f)), closes [#1427](https://github.com/fieldflow360/management-system/issues/1427)
- **orderpipe:** resolved issues reported vendor selection, go to location btns, and provider name in vendor popup ([#1451](https://github.com/fieldflow360/management-system/issues/1451)) ([382e2c4](https://github.com/fieldflow360/management-system/commit/382e2c498e2af771e2eef4511450c43de2c08ff7))
- **orderpipes:** resolved issues reported ([#1438](https://github.com/fieldflow360/management-system/issues/1438)) ([0efcc2a](https://github.com/fieldflow360/management-system/commit/0efcc2abf9fb1ca6424efd0c2c5cec1e1efe88c3)), closes [#1442](https://github.com/fieldflow360/management-system/issues/1442) [#1443](https://github.com/fieldflow360/management-system/issues/1443)
- **orderpipes:** resolved issues reported ([#1432](https://github.com/fieldflow360/management-system/issues/1432)) ([3cffc4b](https://github.com/fieldflow360/management-system/commit/3cffc4bdba0ccf33e6f49928747a048431641d50))
- **Payement Status:** renamed add new type to new new status ([#1521](https://github.com/fieldflow360/management-system/issues/1521)) ([8907952](https://github.com/fieldflow360/management-system/commit/890795264107cf3fbb297be5d8fe55b0d086c419))
- **Payment Status:** fix issue for deleted payment status still appear in Leads & Jobs page ([#1414](https://github.com/fieldflow360/management-system/issues/1414)) ([11952d9](https://github.com/fieldflow360/management-system/commit/11952d9afa39552f9f6949e6b25f3dc4a7b96d97))
- **Project Types:** Update the endpoint of jobs page for reading project types ([#1455](https://github.com/fieldflow360/management-system/issues/1455)) ([842188b](https://github.com/fieldflow360/management-system/commit/842188b21666f0800fa21b858bfe4329b37ad8b1))
- **quickactions:** added prefix to render all quick action files under contractor tab after conversion ([#1525](https://github.com/fieldflow360/management-system/issues/1525)) ([20352b2](https://github.com/fieldflow360/management-system/commit/20352b218a82a1783574cf2065540d0624b0c80f))
- **quickactions:** added quickaction counter to sidebar item title ([#1505](https://github.com/fieldflow360/management-system/issues/1505)) ([8d65e55](https://github.com/fieldflow360/management-system/commit/8d65e55ada5ef623dab055408ca6164a090a7371))
- **quickactions:** removed filter button ([#1508](https://github.com/fieldflow360/management-system/issues/1508)) ([12937e1](https://github.com/fieldflow360/management-system/commit/12937e172d60ac91f810d9b6bcae076372ebda16)), closes [#1507](https://github.com/fieldflow360/management-system/issues/1507)
- **quickactions:** removed lead/job information from title ([#1510](https://github.com/fieldflow360/management-system/issues/1510)) ([abf8c1a](https://github.com/fieldflow360/management-system/commit/abf8c1a9e566133bc78c436bc1ab89bc5a4ba49e)), closes [#1511](https://github.com/fieldflow360/management-system/issues/1511) [#1512](https://github.com/fieldflow360/management-system/issues/1512) [#1514](https://github.com/fieldflow360/management-system/issues/1514)
- remove created_by from search options ([179f806](https://github.com/fieldflow360/management-system/commit/179f80653e614b4174068e8eb91774ff7a245584))
- search vendorform ([8e074ba](https://github.com/fieldflow360/management-system/commit/8e074bacad1e0d1a0224093da5ac79b6cbcc558e))
- **Trash Page:** added form name beside the job name ([#1520](https://github.com/fieldflow360/management-system/issues/1520)) ([295f720](https://github.com/fieldflow360/management-system/commit/295f72001ca710ae715075fa625ddddf44f727ba))
- Update endpoint paths in VendorProviderViewSet documentation ([9543ba9](https://github.com/fieldflow360/management-system/commit/9543ba9d56a886d70d386f879df2c95f0ce85d4d))
- Update VendorProviderViewSet to be read-only ([613e25f](https://github.com/fieldflow360/management-system/commit/613e25f52e7e0318d4aeb8dd022baa9af11bc5d8))
- VendorFormV2 & OrderPipeCategory permissions ([9e77b2e](https://github.com/fieldflow360/management-system/commit/9e77b2ec705f26effcd17ec4156215aa84228b23))

### Features

- Add CRUD operations for vendors (admin only) ([177538c](https://github.com/fieldflow360/management-system/commit/177538cc91304027f498ac4d5cbda0566f5458e1))
- added material_status field to tiling jobs ([e49198e](https://github.com/fieldflow360/management-system/commit/e49198e683ee01f3ec9deb9fb6cacc725ee4a638))
- added search functionality for QuickActions ([0850f14](https://github.com/fieldflow360/management-system/commit/0850f146bb0ec6cd2ffd66e8b3c8dcb9003bda45))
- **CI/CD workflows:** add frontend deployment to AWS Amplify in new-dev-cicd.yml ([4e3c88c](https://github.com/fieldflow360/management-system/commit/4e3c88c77f0066a9d7c36da6a7741f97d51e5be3))
- **ci/cd:** add CSP_ENABLED variable to staging CI/CD workflow ([0f96c9b](https://github.com/fieldflow360/management-system/commit/0f96c9bd4fdb90204289249fff5f2b2d467ccca4))
- **ci/cd:** add new CI/CD workflow for staging environment with backend and frontend deployment ([6963f59](https://github.com/fieldflow360/management-system/commit/6963f59252ae73f4efeb3fcdfa3a9795431aa9c4))
- **ci/cd:** add new CI/CD workflow for staging environment with backend and frontend deployment ([a1751bc](https://github.com/fieldflow360/management-system/commit/a1751bccb1872abd22d4f12b9911b51563c9fcda))
- **ci/cd:** add push trigger for sync-stg-cicd branch in CI/CD workflow ([3ec38dd](https://github.com/fieldflow360/management-system/commit/3ec38dd32565756dbb7d280e52623df8020c99dc))
- **Contact page:** adding backend sorting for contact table ([#1401](https://github.com/fieldflow360/management-system/issues/1401)) ([f9b6a4c](https://github.com/fieldflow360/management-system/commit/f9b6a4c518a871694097f21d8dc962a451eba5c2))
- Created Model, Serializers, ViewSets for QuickActions ([3f0f3e3](https://github.com/fieldflow360/management-system/commit/3f0f3e37e7a071993bf72d306dd6e916052f8120))
- Enhance VendorFormViewSetV2 with search and filters ([acdf5eb](https://github.com/fieldflow360/management-system/commit/acdf5ebbbd54c7c713494e2b8bdecb4a3ee70279))
- **Equipment Serial Number Image:** added serial number image to Machine & Vehicle. ([#1406](https://github.com/fieldflow360/management-system/issues/1406)) ([4358682](https://github.com/fieldflow360/management-system/commit/4358682a3a3f0c1d0004ee1191042c78ff0e261d))
- Implement admin CRUD operations for Order Pipe categories, types, and options (86ewdr1gu) ([b62f5ae](https://github.com/fieldflow360/management-system/commit/b62f5ae2af8b921b30b3658bcb259b315f7b5101))
- Implement CRUD operations for VendorProvider ([8a0021b](https://github.com/fieldflow360/management-system/commit/8a0021bf4bf2ca8daf09cbf19275542b17c6dbbb))
- **Order Pipe:** add review order summary on order pipe detail ([#1434](https://github.com/fieldflow360/management-system/issues/1434)) ([a75b4b0](https://github.com/fieldflow360/management-system/commit/a75b4b000cfa6939fb4dad599e24d8e1ac9ce2ac))
- **order pipe:** added delete feature in review order to delete the order ([#1416](https://github.com/fieldflow360/management-system/issues/1416)) ([104f08b](https://github.com/fieldflow360/management-system/commit/104f08be5840430e3d6591dabb5b7936420ac2af))
- **Order Pipe:** Fix the flow for the order pipe button on tiling jobs ([#1421](https://github.com/fieldflow360/management-system/issues/1421)) ([1acdd2e](https://github.com/fieldflow360/management-system/commit/1acdd2e5aa09ee9919fe01755e080b553af98b45))
- **Order Pipe:** implemented order pipe page access control ([#1444](https://github.com/fieldflow360/management-system/issues/1444)) ([0bf2fdf](https://github.com/fieldflow360/management-system/commit/0bf2fdf6756f098c4d234cef9579cb2480d63035))
- **Order Pipe:** implemented search & filter order ([#1439](https://github.com/fieldflow360/management-system/issues/1439)) ([3deb682](https://github.com/fieldflow360/management-system/commit/3deb68229b845a1c6355e6386f5654fc078c70f8))
- **Order pipes:** implemented Figma Design and Backend Integration for the first two order pipe details pages ([7d420b7](https://github.com/fieldflow360/management-system/commit/7d420b74e7ef3374c841d61dc1a81fabf704e81a)), closes [#1402](https://github.com/fieldflow360/management-system/issues/1402) [#1403](https://github.com/fieldflow360/management-system/issues/1403) [#1404](https://github.com/fieldflow360/management-system/issues/1404)
- **Order Pipe:** update order pipe to vendor forms v2 ([#1420](https://github.com/fieldflow360/management-system/issues/1420)) ([82b19c8](https://github.com/fieldflow360/management-system/commit/82b19c88cbc45a5dc7df20038c0004170a606f10))
- **orderpipe:** implemented generate invoice pdf ([#1524](https://github.com/fieldflow360/management-system/issues/1524)) ([23f4a09](https://github.com/fieldflow360/management-system/commit/23f4a09560d28854d6dd08411226d9e6c4209210))
- **orderpipes:** implemnted vendor selection figma design ([#1382](https://github.com/fieldflow360/management-system/issues/1382)) ([6176a55](https://github.com/fieldflow360/management-system/commit/6176a559cc5e0a569d44e5101e08a31fe7350f13))
- **PipeDropLocation:** Implemented VendorForms Hook,Serive,& Context ([#1408](https://github.com/fieldflow360/management-system/issues/1408)) ([d05bdcd](https://github.com/fieldflow360/management-system/commit/d05bdcde1985e2db8cc111336e9e709a31271ef3)), closes [#1409](https://github.com/fieldflow360/management-system/issues/1409) [#1411](https://github.com/fieldflow360/management-system/issues/1411)
- **Project Type:** added project type status on store management for leads & job pages ([#1405](https://github.com/fieldflow360/management-system/issues/1405)) ([123cb5d](https://github.com/fieldflow360/management-system/commit/123cb5dfe28c21bf44cce91b530e3a33c719985d))
- **quickactions:** implemented figma design of quick action page and form ([#1460](https://github.com/fieldflow360/management-system/issues/1460)) ([717a05f](https://github.com/fieldflow360/management-system/commit/717a05f3ffec55c76f2346ef32d87148bf0e836c))
- **quickactions:** integrated convert to job & restricted actions to admin privilege ([#1487](https://github.com/fieldflow360/management-system/issues/1487)) ([1891fb9](https://github.com/fieldflow360/management-system/commit/1891fb9a81f0135d2c9ad4c2e895b96131f9ba36))
- **quickactions:** integrated main page to back-end ([#1468](https://github.com/fieldflow360/management-system/issues/1468)) ([2bee074](https://github.com/fieldflow360/management-system/commit/2bee0745d0ff4427c3c85dc3b850fb2dbb3fc727)), closes [#1469](https://github.com/fieldflow360/management-system/issues/1469) [#1470](https://github.com/fieldflow360/management-system/issues/1470) [#1471](https://github.com/fieldflow360/management-system/issues/1471)
- **Status management:** added payment status tab on status management ([#1397](https://github.com/fieldflow360/management-system/issues/1397)) ([5be33ce](https://github.com/fieldflow360/management-system/commit/5be33ce2e4991f714f9c07a2ca0c0bc748b43400))
- **Units:** update units for the organization to as per location ([#1452](https://github.com/fieldflow360/management-system/issues/1452)) ([8a3f103](https://github.com/fieldflow360/management-system/commit/8a3f1037962b4c11e75bddef29453868066f2665))
- **upcoming features:** update upcoming feature page ([#1515](https://github.com/fieldflow360/management-system/issues/1515)) ([24dcc58](https://github.com/fieldflow360/management-system/commit/24dcc5819a2bf250aca660ca70b9fd743f233280))

### Reverts

- revert the permission commit ([2ca84ba](https://github.com/fieldflow360/management-system/commit/2ca84ba3d903a932cf3bbb598c4cf3d6d00cabac))

## [0.1.43](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.43...frontend-v0.1.43) (2026-02-04)

## [0.1.42](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.42...frontend-v0.1.42) (2026-02-04)

### Bug Fixes

- **jobs & leads:** show status and one call in trash view with disable mode ([#1376](https://github.com/fieldflow360/management-system/issues/1376)) ([458623f](https://github.com/fieldflow360/management-system/commit/458623fd07d65db8b9b33ef895ec0570110c3a18))

## [0.1.41](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.41...frontend-v0.1.41) (2026-02-04)

### Bug Fixes

- **jobs:** fix redirect when trash a job ([#1374](https://github.com/fieldflow360/management-system/issues/1374)) ([c543855](https://github.com/fieldflow360/management-system/commit/c54385559aa7b4aa6bb36850e9257495cce21dcc))

## [0.1.40](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.40...frontend-v0.1.40) (2026-02-04)

## [0.1.39](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.39...frontend-v0.1.39) (2026-02-04)

## [0.1.38](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.38...frontend-v0.1.38) (2026-02-04)

## [0.1.37](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.37...frontend-v0.1.37) (2026-02-04)

## [0.1.36](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.36...frontend-v0.1.36) (2026-02-04)

## [0.1.35](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.35...frontend-v0.1.35) (2026-02-04)

## [0.1.34](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.34...frontend-v0.1.34) (2026-02-04)

## [0.1.33](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.33...frontend-v0.1.33) (2026-02-04)

## [0.1.32](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.32...frontend-v0.1.32) (2026-02-03)

## [0.1.31](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.31...frontend-v0.1.31) (2026-02-03)

### Bug Fixes

- **dialogs:** displayed entity name instead of po or id ([#1357](https://github.com/fieldflow360/management-system/issues/1357)) ([81d9075](https://github.com/fieldflow360/management-system/commit/81d90754264005a86af5075d12966bc4fa1ba25a))

## [0.1.30](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.30...frontend-v0.1.30) (2026-02-03)

### Bug Fixes

- **equimentAssignment:** resolved filter data refresh issue ([#1356](https://github.com/fieldflow360/management-system/issues/1356)) ([af3969d](https://github.com/fieldflow360/management-system/commit/af3969d9bfc6f014f58beb7e157da64d6e5dc370))

## [0.1.29](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.29...frontend-v0.1.29) (2026-02-03)

### Bug Fixes

- **equipment/files:** added checks for filter card fields and file type ([#1354](https://github.com/fieldflow360/management-system/issues/1354)) ([2a0e324](https://github.com/fieldflow360/management-system/commit/2a0e324520e765d880ceaf4a7a787ab05251b4fd))

## [0.1.28](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.28...frontend-v0.1.28) (2026-02-03)

## [0.1.27](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.27...frontend-v0.1.27) (2026-02-03)

## [0.1.26](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.26...frontend-v0.1.26) (2026-02-03)

## [0.1.25](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.25...frontend-v0.1.25) (2026-02-03)

## [0.1.24](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.24...frontend-v0.1.24) (2026-02-03)

### Bug Fixes

- **lead form:** make follow ups the default status in add form ([#1349](https://github.com/fieldflow360/management-system/issues/1349)) ([e8fcdf3](https://github.com/fieldflow360/management-system/commit/e8fcdf34386f32274162f485bcaf160604a685fc))
- **ui:** restored dialog functionality in task and completed pages ([#1348](https://github.com/fieldflow360/management-system/issues/1348)) ([0ca7355](https://github.com/fieldflow360/management-system/commit/0ca73550ebf34fe4c73c5a8c66750becd6f6ef2d))

## [0.1.23](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.23...frontend-v0.1.23) (2026-02-03)

## [0.1.22](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.22...frontend-v0.1.22) (2026-02-03)

## [0.1.21](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.21...frontend-v0.1.21) (2026-02-03)

### Bug Fixes

- **bugs:** fix Clickup issue reported bugs ([#1342](https://github.com/fieldflow360/management-system/issues/1342)) ([a916339](https://github.com/fieldflow360/management-system/commit/a91633951d05444df36a7c08eaadf08004a020d1))
- **tiling job:** fix refresh issue and pagination when bulk archive page 2 ([#1344](https://github.com/fieldflow360/management-system/issues/1344)) ([063efd1](https://github.com/fieldflow360/management-system/commit/063efd12d3e9eec601db79eb83c4d9bf9734d982))

## [0.1.20](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.20...frontend-v0.1.20) (2026-02-03)

### Bug Fixes

- **ContactViewMore:** add contactviewmoreschema to fix ui ([#1343](https://github.com/fieldflow360/management-system/issues/1343)) ([fd25457](https://github.com/fieldflow360/management-system/commit/fd25457358e4e02f4d4bc02188a397d70262838f))
- **forms:** fix issue for button type submit ([#1340](https://github.com/fieldflow360/management-system/issues/1340)) ([e3b55a3](https://github.com/fieldflow360/management-system/commit/e3b55a35a589310f3f971fb73cc0aac6d9bb5374))
- **todo-list:** use backend overdue flag instead of frontend calculation ([#1346](https://github.com/fieldflow360/management-system/issues/1346)) ([15af233](https://github.com/fieldflow360/management-system/commit/15af2338008231b16bf058bfd318f3fb348db63e))

## [0.1.19](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.19...frontend-v0.1.19) (2026-02-02)

### Bug Fixes

- **lead-forms:** memoize initial values on Leads tab ([#1338](https://github.com/fieldflow360/management-system/issues/1338)) ([2774ef5](https://github.com/fieldflow360/management-system/commit/2774ef53e707ead5d2fec55295d11d320605995c))

## [0.1.18](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.18...frontend-v0.1.18) (2026-02-02)

## [0.1.17](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.17...frontend-v0.1.17) (2026-02-02)

### Bug Fixes

- **upcoming features:** remove Tile Drainage Detection (AI Mapping) ([#1272](https://github.com/fieldflow360/management-system/issues/1272)) ([c82ba91](https://github.com/fieldflow360/management-system/commit/c82ba91e5882ff8e7a3da39701d2e12e295be693))

### Features

- **upcoming feature:** implement new page upcoming feature ([#1268](https://github.com/fieldflow360/management-system/issues/1268)) ([879a7f5](https://github.com/fieldflow360/management-system/commit/879a7f5a913e9597a00b05118ae29f3fbb1d5c56))

## [0.1.16](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.16...frontend-v0.1.16) (2026-02-02)

## [0.1.15](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.15...frontend-v0.1.15) (2026-02-02)

### Bug Fixes

- **OrganizationForm:** add reset functionality and update cancel button behavior ([#1331](https://github.com/fieldflow360/management-system/issues/1331)) ([b2ffc1d](https://github.com/fieldflow360/management-system/commit/b2ffc1de8be6abc700b9697ad3e365930a787bba))

## [0.1.14](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.14...frontend-v0.1.14) (2026-02-02)

## [0.1.13](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.13...frontend-v0.1.13) (2026-02-02)

### Bug Fixes

- **generic-form:** fix resolver build issue for generic forms ([#1333](https://github.com/fieldflow360/management-system/issues/1333)) ([03535e0](https://github.com/fieldflow360/management-system/commit/03535e07188546186fee19ec3a6b04486ac002c3))

## [0.1.12](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.12...frontend-v0.1.12) (2026-02-02)

### Bug Fixes

- **ui:** fixed ui button visibility, labels, and overdue task colors ([#1326](https://github.com/fieldflow360/management-system/issues/1326)) ([1cc3da4](https://github.com/fieldflow360/management-system/commit/1cc3da4a285c7dfaa27111362f6157d2566472cb))

## [0.1.11](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.11...frontend-v0.1.11) (2026-02-02)

### Bug Fixes

- **GenericForm:** type useForm with FormValues to fix zodResolver build error ([#1332](https://github.com/fieldflow360/management-system/issues/1332)) ([2c9089a](https://github.com/fieldflow360/management-system/commit/2c9089ab29c00d12fdf868329cfd5e186a57d0c8))

## [0.1.10](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.10...frontend-v0.1.10) (2026-02-02)

## [0.1.9](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.9...frontend-v0.1.9) (2026-02-02)

## [0.1.8](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.8...frontend-v0.1.8) (2026-01-30)

## [0.1.7](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.7...frontend-v0.1.7) (2026-01-30)

## [0.1.6](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.6...frontend-v0.1.6) (2026-01-30)

## [0.1.5](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.5...frontend-v0.1.5) (2026-01-30)

## [0.1.4](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.4...frontend-v0.1.4) (2026-01-30)

### Bug Fixes

- **bugs:** fix bugs listed on Clickup ([#1323](https://github.com/fieldflow360/management-system/issues/1323)) ([2385ea8](https://github.com/fieldflow360/management-system/commit/2385ea88aae146660df54e664b917b27ac154989))

## [0.1.3](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.3...frontend-v0.1.3) (2026-01-30)

### Bug Fixes

- **CSP config:** add manifest src and style and font ([8465c84](https://github.com/fieldflow360/management-system/commit/8465c847f955727e6c4cf066d93882490f847860))

## [0.1.2](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.2...frontend-v0.1.2) (2026-01-30)

## [0.1.1](https://github.com/fieldflow360/management-system/compare/frontend-v0.1.1...frontend-v0.1.1) (2026-01-30)

### Bug Fixes

- **bugs:** fix bugs reported on Clickup ([#1319](https://github.com/fieldflow360/management-system/issues/1319)) ([2f11839](https://github.com/fieldflow360/management-system/commit/2f118394bad074bf1e6b1976fadf02909625ee90))

# [0.1.0](https://github.com/fieldflow360/management-system/compare/v1.1.0...v0.1.0) (2026-01-30)

### Bug Fixes

- add support for KML map data ([294aad2](https://github.com/fieldflow360/management-system/commit/294aad2a652fbd2a1770b1a2ad303601ba96ffd6))
- **billing page:** fix infinite loop in calling subscription info endpoint ([#1304](https://github.com/fieldflow360/management-system/issues/1304)) ([c144663](https://github.com/fieldflow360/management-system/commit/c144663ebc54d0a07aed7da9af592c0ac3181dfd))
- **billing:** allow billing endpoint to get called on billing page ([#1165](https://github.com/fieldflow360/management-system/issues/1165)) ([2d92d1a](https://github.com/fieldflow360/management-system/commit/2d92d1a6aaac386471a84251f58732ad4c1b9d64))
- **billing:** fix visibility issue of billing tab from secondary sidebar ([#1162](https://github.com/fieldflow360/management-system/issues/1162)) ([93adea7](https://github.com/fieldflow360/management-system/commit/93adea7ae1547d67e485ff1217378a546240be15))
- bug delete task_type return null (86evyurfh) ([68454d8](https://github.com/fieldflow360/management-system/commit/68454d8503fb186709e762afbfa4d98bece174b8))
- **bugs:** fix issue reported on Clickup ([#1307](https://github.com/fieldflow360/management-system/issues/1307)) ([736d431](https://github.com/fieldflow360/management-system/commit/736d4313ed6a655908c44c22fcf56e0814958937))
- **build:** fix build type script error for table render components ([#1217](https://github.com/fieldflow360/management-system/issues/1217)) ([346c4ce](https://github.com/fieldflow360/management-system/commit/346c4ceec96701f4c3f5aa4ba77e6053d81e0aaf))
- **build:** fixes build issue for the ununsed variable for typescript ([#1251](https://github.com/fieldflow360/management-system/issues/1251)) ([3a75e5d](https://github.com/fieldflow360/management-system/commit/3a75e5de2d7bb97ff911ba95b817e0ded6965721))
- **completed & cancelled:** fix issue redirecting and endpoint in completed and cancelled page ([#1144](https://github.com/fieldflow360/management-system/issues/1144)) ([3e0caca](https://github.com/fieldflow360/management-system/commit/3e0caca872f1591cc61d66f38cf20aefc480d6e7))
- **completed & cancelled:** fix issue redirecting and endpoint in completed and cancelled page ([#1144](https://github.com/fieldflow360/management-system/issues/1144)) ([a0c16bf](https://github.com/fieldflow360/management-system/commit/a0c16bfccaee2c9467dc83a7a5a30b7d1fac8c48))
- **completed-canceled:** fix issue reported with implementation for permissions ([#1170](https://github.com/fieldflow360/management-system/issues/1170)) ([84e4a02](https://github.com/fieldflow360/management-system/commit/84e4a02af280706a7049f0ba60fae03bcf7609dd))
- **completed:** fix redirecting when double click in table and grid view ([#1175](https://github.com/fieldflow360/management-system/issues/1175)) ([56061b6](https://github.com/fieldflow360/management-system/commit/56061b69739bdcb5e8277bc898eb3154abcab306))
- **contact:** add validation on email and phone and zip code for contact ([#1153](https://github.com/fieldflow360/management-system/issues/1153)) ([f79b986](https://github.com/fieldflow360/management-system/commit/f79b986877a234657d0402fd1aea5d90f641fe90))
- **contact:** add validation on email and phone and zip code for contact ([#1153](https://github.com/fieldflow360/management-system/issues/1153)) ([9ee7620](https://github.com/fieldflow360/management-system/commit/9ee7620da19769732b4792d8eaab2db4deb62e7d))
- **contact:** fix permission check to updated permission based upon lead & job write access ([#1160](https://github.com/fieldflow360/management-system/issues/1160)) ([33cec19](https://github.com/fieldflow360/management-system/commit/33cec19b3ff0a801bfdd4ff69e0d511d862c1605))
- **contacts:** farms, edit permissions ([#1122](https://github.com/fieldflow360/management-system/issues/1122)) ([359aa90](https://github.com/fieldflow360/management-system/commit/359aa907855acd0c1e30aa53fb0fe629f7449d33))
- **create-role:** added permission selection upon role creation ([#1141](https://github.com/fieldflow360/management-system/issues/1141)) ([49c1914](https://github.com/fieldflow360/management-system/commit/49c1914369661b255d7f93621bb4242797bf82c1))
- **create-role:** added permission selection upon role creation ([#1141](https://github.com/fieldflow360/management-system/issues/1141)) ([df4c702](https://github.com/fieldflow360/management-system/commit/df4c702783045cce6a8b4d670fc3ae563db9205d))
- **crew management:** action menu visibility ([#1149](https://github.com/fieldflow360/management-system/issues/1149)) ([fee3910](https://github.com/fieldflow360/management-system/commit/fee3910c71fda0ae00123dd34103e44ae44cf3b2))
- **crew management:** action menu visibility ([#1149](https://github.com/fieldflow360/management-system/issues/1149)) ([777cdd7](https://github.com/fieldflow360/management-system/commit/777cdd780de7d399ea9b2ca89aeea1acf7ec1b56))
- **dashboard:** fix issue reported ([#1139](https://github.com/fieldflow360/management-system/issues/1139)) ([c905acd](https://github.com/fieldflow360/management-system/commit/c905acd8017d27d8985e01602a377c0a2a15e455))
- **dashboard:** fix issue reported ([#1139](https://github.com/fieldflow360/management-system/issues/1139)) ([1509d3f](https://github.com/fieldflow360/management-system/commit/1509d3f4b01fd573ab3844a01aaf0b54ffe8892d))
- **dependencies:** remove lightningcss lib from package.json ([#1250](https://github.com/fieldflow360/management-system/issues/1250)) ([9af6e57](https://github.com/fieldflow360/management-system/commit/9af6e5716338f39f84fdb5ffebc3a1521695e762))
- **equipment:** new api endpoints ([#1133](https://github.com/fieldflow360/management-system/issues/1133)) ([95ff8bc](https://github.com/fieldflow360/management-system/commit/95ff8bc176534c04ed670d0badd4253c30e67d0c))
- **equipment:** new api endpoints ([#1133](https://github.com/fieldflow360/management-system/issues/1133)) ([d88f575](https://github.com/fieldflow360/management-system/commit/d88f5754941c3060dd2fc7006208258f4ae85c7b))
- **equipment:** new endpoints and bugs ([#1138](https://github.com/fieldflow360/management-system/issues/1138)) ([70c014b](https://github.com/fieldflow360/management-system/commit/70c014be8d3064f771badba15e9575023d52486e))
- **equipment:** new endpoints and bugs ([#1138](https://github.com/fieldflow360/management-system/issues/1138)) ([2475728](https://github.com/fieldflow360/management-system/commit/24757282e88d98ccbfa752ac4520d72d5e1eb28a))
- **equipment:** permissions bugs ([#1126](https://github.com/fieldflow360/management-system/issues/1126)) ([ebf4c11](https://github.com/fieldflow360/management-system/commit/ebf4c11ba171a667e688c3aa334bb2589a0d0cd8))
- **farm:** fix problem rerouting in farm page for tiling job and lead ([#1203](https://github.com/fieldflow360/management-system/issues/1203)) ([f046bd1](https://github.com/fieldflow360/management-system/commit/f046bd135bf1eee077aa106333e3159720a002cf))
- **filters:** implement all filters with popover and fix to sending tiling insted drainage tiling in map page ([#1284](https://github.com/fieldflow360/management-system/issues/1284)) ([9fc1fbb](https://github.com/fieldflow360/management-system/commit/9fc1fbb823b008a45d2830e053eee971dfbc205a))
- fixed imports ([48816b7](https://github.com/fieldflow360/management-system/commit/48816b7fe9c0ad5ade9ed0a56d108ee5689d91b7))
- fixed task_type permissions ([fad8d90](https://github.com/fieldflow360/management-system/commit/fad8d902e72c7bd306a7610041d55a5716793f12))
- **generic table:** pagination refactoring ([#1297](https://github.com/fieldflow360/management-system/issues/1297)) ([faed758](https://github.com/fieldflow360/management-system/commit/faed75881f90da6daafb791b4af0a01795f2900c))
- **generic table:** table layout for pages ([#1296](https://github.com/fieldflow360/management-system/issues/1296)) ([1f0d17c](https://github.com/fieldflow360/management-system/commit/1f0d17c6a763393cd5ff5e8a12b8327034897054))
- **hooks:** improve usePermissions ([#1050](https://github.com/fieldflow360/management-system/issues/1050)) ([05271f2](https://github.com/fieldflow360/management-system/commit/05271f2a52123af6883b12b0a511111823f8b474))
- **jobs/showmorecard:** migrated equipment , farms, contacts to new record end-points ([#1134](https://github.com/fieldflow360/management-system/issues/1134)) ([ffdeb6b](https://github.com/fieldflow360/management-system/commit/ffdeb6bb88395bb2e9bd49db84010bbac85ec5e0))
- **jobs/showmorecard:** migrated equipment , farms, contacts to new record end-points ([#1134](https://github.com/fieldflow360/management-system/issues/1134)) ([bd65ad7](https://github.com/fieldflow360/management-system/commit/bd65ad7e3641fdbd7cf6bef6fe275bf1c94ccbab))
- **jobs:** add equipment if write perm ([#1168](https://github.com/fieldflow360/management-system/issues/1168)) ([357b877](https://github.com/fieldflow360/management-system/commit/357b877de90b88dd630f677b33e96492b9f71dba))
- **jobs:** fix write permissions for financial and estimate in job management ([#1108](https://github.com/fieldflow360/management-system/issues/1108)) ([8233a91](https://github.com/fieldflow360/management-system/commit/8233a91b78df726a66f5e20bf34949775896862a))
- **jobs:** fixed tiling routing issues ([#1140](https://github.com/fieldflow360/management-system/issues/1140)) ([916528e](https://github.com/fieldflow360/management-system/commit/916528e7a93c7e4a2a0ee886513ee910b5a277ce))
- **jobs:** fixed tiling routing issues ([#1140](https://github.com/fieldflow360/management-system/issues/1140)) ([f485777](https://github.com/fieldflow360/management-system/commit/f4857776955c203530c2b5702380c9b3f29a32c9))
- **jobs:** make add farm in job access for edit job permission ([#1184](https://github.com/fieldflow360/management-system/issues/1184)) ([89e674a](https://github.com/fieldflow360/management-system/commit/89e674a1bed6a88dee7df406a133498abf015e61))
- **lead File-job Financial:** fix bugs in file tab lead and financial tab job ([#1179](https://github.com/fieldflow360/management-system/issues/1179)) ([58dcb92](https://github.com/fieldflow360/management-system/commit/58dcb9284b7942e009650f8e7e7d65d5b1b19844))
- **lead:** remove more actions buttons from leads pages header ([#1173](https://github.com/fieldflow360/management-system/issues/1173)) ([1513e63](https://github.com/fieldflow360/management-system/commit/1513e63b8acbe7038993184ad64cc7ebdc8c7e48))
- **leads:** fixed create leadtypes and corepoints ([#1167](https://github.com/fieldflow360/management-system/issues/1167)) ([2c34258](https://github.com/fieldflow360/management-system/commit/2c34258381c66c6de39a5ac718e116d99326a72f))
- **leads:** migrated to new record end-points, resolve file upload issues ([#1159](https://github.com/fieldflow360/management-system/issues/1159)) ([4478376](https://github.com/fieldflow360/management-system/commit/447837650e6ddf5611e5f1a72c09daaeae65ca87))
- **leads:** sprint 5 leads page bugs ([#1115](https://github.com/fieldflow360/management-system/issues/1115)) ([32a38c2](https://github.com/fieldflow360/management-system/commit/32a38c202e84614b49b6e07d1ca0ea7086874739))
- **maintenance:** implement new equipment endpoint and fix permissions for this page ([#1157](https://github.com/fieldflow360/management-system/issues/1157)) ([3a9560a](https://github.com/fieldflow360/management-system/commit/3a9560a5e48a64836691b885a7e9ec7ed47395d4))
- **map:** fix Array check to verify the processing of Array ([#1158](https://github.com/fieldflow360/management-system/issues/1158)) ([745bded](https://github.com/fieldflow360/management-system/commit/745bded7c76f03e85022258486e6588ea1dd2d8a))
- **map:** fix client tab on map page to show marker ([#1176](https://github.com/fieldflow360/management-system/issues/1176)) ([c6dcd51](https://github.com/fieldflow360/management-system/commit/c6dcd51060d95bbf66d8e9ad80521a6edbf748aa))
- **map:** fix issue with client tab error for null value ([#1155](https://github.com/fieldflow360/management-system/issues/1155)) ([36d539d](https://github.com/fieldflow360/management-system/commit/36d539d5e876cbb7b585a9c815198665648c803e))
- **map:** fix issue with client tab error for null value ([#1155](https://github.com/fieldflow360/management-system/issues/1155)) ([10e4cb2](https://github.com/fieldflow360/management-system/commit/10e4cb2fe212aac1dd264d9686a5119bd6c85729))
- **onsite:** fix assigned and admin can edit onsite tracking page ([#1143](https://github.com/fieldflow360/management-system/issues/1143)) ([3352944](https://github.com/fieldflow360/management-system/commit/3352944d6ef341a93652000badc313844068edc2))
- **onsite:** fix assigned and admin can edit onsite tracking page ([#1143](https://github.com/fieldflow360/management-system/issues/1143)) ([20eac70](https://github.com/fieldflow360/management-system/commit/20eac70a89f3664ab8d0fb44ceb8d782e4ce76b8))
- **onsite:** remove equipment button from onsite page ([#1172](https://github.com/fieldflow360/management-system/issues/1172)) ([a24526a](https://github.com/fieldflow360/management-system/commit/a24526aef7d3f40acaaf7e14a21d48c49b1ee779))
- **permission-warning:** added warning on Co & Ca permission ([#1142](https://github.com/fieldflow360/management-system/issues/1142)) ([531f014](https://github.com/fieldflow360/management-system/commit/531f014760c98ea11976bcc3fc3c225b5723ec00))
- **permission-warning:** added warning on Co & Ca permission ([#1142](https://github.com/fieldflow360/management-system/issues/1142)) ([db3b56e](https://github.com/fieldflow360/management-system/commit/db3b56e04ac45afd3c8e774692acfbeeeb35b287))
- **permission:** fix permission removal id issues ([#1128](https://github.com/fieldflow360/management-system/issues/1128)) ([02c97be](https://github.com/fieldflow360/management-system/commit/02c97bea326e8437be73f92171a3252e6825a267))
- **permissions:** make organization info perssions admin only ([#1145](https://github.com/fieldflow360/management-system/issues/1145)) ([f91e3bc](https://github.com/fieldflow360/management-system/commit/f91e3bc0a24da660fd6c581c874167ad423643da))
- **permissions:** make organization info perssions admin only ([#1145](https://github.com/fieldflow360/management-system/issues/1145)) ([1ae507b](https://github.com/fieldflow360/management-system/commit/1ae507b7aaff37de98560dbe4fff2a2e7ac601bf))
- **permissions:** permissions editor rework ([#1083](https://github.com/fieldflow360/management-system/issues/1083)) ([98ca033](https://github.com/fieldflow360/management-system/commit/98ca0332e2010eab80e942df8048f98bf560bc47))
- **permissions:** read, write, delete access for pages ([#1077](https://github.com/fieldflow360/management-system/issues/1077)) ([49b239f](https://github.com/fieldflow360/management-system/commit/49b239f5ad2d4061d4f4bc41e784918dc3f12571))
- **perms:** enum for storage key, permissions bugs ([#1109](https://github.com/fieldflow360/management-system/issues/1109)) ([cce5769](https://github.com/fieldflow360/management-system/commit/cce57694566c6e529817a6e0798429d97d067b75))
- prevent sending invitations beyond the available seat limit ([5eb40f4](https://github.com/fieldflow360/management-system/commit/5eb40f450d6c86313be255c9dded636922bd4e87))
- remove extra permissions in permission_map ([4bc9670](https://github.com/fieldflow360/management-system/commit/4bc9670f9a00f0b44722502afafc938947d59e47))
- removed pending filter from task_status (86evyutk2) ([58e92e1](https://github.com/fieldflow360/management-system/commit/58e92e165b323ce0cdc54e70fd0ffbaf2a2d4b18))
- removed wrong name and description filtering ([cf1a651](https://github.com/fieldflow360/management-system/commit/cf1a651015e677060e4e2318eac6703039f309cd))
- **setting:** added new endpoints for setting only while making rest to use old one ([#1152](https://github.com/fieldflow360/management-system/issues/1152)) ([94a9aac](https://github.com/fieldflow360/management-system/commit/94a9aac7c56d9e5ff2567e7bf1286b83662ea699))
- **setting:** added new endpoints for setting only while making rest to use old one ([#1152](https://github.com/fieldflow360/management-system/issues/1152)) ([5811070](https://github.com/fieldflow360/management-system/commit/5811070a2311bff271247a21d14e91145d2265fd))
- **showmorecard-tiling jobs:** implemented estimate tab via seperate endpoint ([#1185](https://github.com/fieldflow360/management-system/issues/1185)) ([eb63149](https://github.com/fieldflow360/management-system/commit/eb63149cfda404a813525e7f158e6f65012cbb2e))
- **showmoreCard:** resolved issues reported in job pages ticket ([#1117](https://github.com/fieldflow360/management-system/issues/1117)) ([186ce4f](https://github.com/fieldflow360/management-system/commit/186ce4ff06e1665e938cc10f7ecd0eaa245c8b57))
- **sidebar:** fix visibility to owner in the sidebar ([#1163](https://github.com/fieldflow360/management-system/issues/1163)) ([f15773b](https://github.com/fieldflow360/management-system/commit/f15773b4b49ce2b121cdb31298ca1da932dbd92b))
- **sidebar:** implement permission for only admin user can show invite button ([#1177](https://github.com/fieldflow360/management-system/issues/1177)) ([22e37de](https://github.com/fieldflow360/management-system/commit/22e37dea015d39df178717788ed77a7412fa6c86))
- **subscribe:** fix type script errors in jsx elements ([#1187](https://github.com/fieldflow360/management-system/issues/1187)) ([34530ed](https://github.com/fieldflow360/management-system/commit/34530edec88c4a6e39daaa586b3c940db7c8842d))
- switched CorePointForTilingLeadViewSet to use HasPermission ([8ff7eac](https://github.com/fieldflow360/management-system/commit/8ff7eace24e7e281afbdc38a15edd1cd947b1b4f))
- **task form:** fix tickets bug issues in task form ([#1214](https://github.com/fieldflow360/management-system/issues/1214)) ([c358cf5](https://github.com/fieldflow360/management-system/commit/c358cf53723d65d5c015ba9e6cb165c6153d0728))
- **TaskColumns:** date columns accepts dates past, description column expands ([#1218](https://github.com/fieldflow360/management-system/issues/1218)) ([34a0731](https://github.com/fieldflow360/management-system/commit/34a0731d7b5aa85d73a518d134faadac20579dfc))
- **TaskColumns:** Task Column drop down menus personalization modified ([#1215](https://github.com/fieldflow360/management-system/issues/1215)) ([fc31c19](https://github.com/fieldflow360/management-system/commit/fc31c1957be2b501423f45dd49df53fa245e13be))
- **team page:** hook render order ([#1107](https://github.com/fieldflow360/management-system/issues/1107)) ([4c2b137](https://github.com/fieldflow360/management-system/commit/4c2b137d879bb67af0b62d564b0c14bf18997bf9))
- **tiling:** fix issue with showing items ([7d5aad1](https://github.com/fieldflow360/management-system/commit/7d5aad197cadd3e9d7a6d8ddcc6f41f02529b20f))
- **todo page:** fix calender bug in todo table for firefox ([#1219](https://github.com/fieldflow360/management-system/issues/1219)) ([ad24a52](https://github.com/fieldflow360/management-system/commit/ad24a523d3c87fbb1b84a8a60b786cd8726b20d5))
- **todo page:** fix tickets bug for todo page ([#1216](https://github.com/fieldflow360/management-system/issues/1216)) ([1a2199c](https://github.com/fieldflow360/management-system/commit/1a2199c3836c88f54100a60c08b7d48a58d02672))
- **trash page:** leads fetch ([#1148](https://github.com/fieldflow360/management-system/issues/1148)) ([3aaba6b](https://github.com/fieldflow360/management-system/commit/3aaba6b847b8054a8c8251cec784d7ff015e18a4))
- **trash page:** leads fetch ([#1148](https://github.com/fieldflow360/management-system/issues/1148)) ([a9e15fb](https://github.com/fieldflow360/management-system/commit/a9e15fb0829193fe5e808d39dd72470fb50e48c0))
- **trash:** equipment urls ([#1166](https://github.com/fieldflow360/management-system/issues/1166)) ([6f929a7](https://github.com/fieldflow360/management-system/commit/6f929a7a2a0c0bcab184b075e02f654cf0c47050))
- **trash:** fix delete action item from the tiling jobs ([a822e54](https://github.com/fieldflow360/management-system/commit/a822e540c6bf8cdf23dc635103ad078945c8edfe))
- **trash:** fix trash page param to job fetching api call for trashed items ([#1169](https://github.com/fieldflow360/management-system/issues/1169)) ([f5a22c5](https://github.com/fieldflow360/management-system/commit/f5a22c53b34009c4e691416ac2233ed341463ce3))
- **view preference:** enhance view preference hook ([#1316](https://github.com/fieldflow360/management-system/issues/1316)) ([7ffb030](https://github.com/fieldflow360/management-system/commit/7ffb030e8c3703969ecc6101df15e7eb1bf434d9))
- **xml/kml:** fix unit from meter to inches and display his unit ([#1236](https://github.com/fieldflow360/management-system/issues/1236)) ([abe6ce9](https://github.com/fieldflow360/management-system/commit/abe6ce9c588f8ddabd880c690cdc1936bd59838a))

### Features

- Add Doxygen docstrings for crew_management ([b9b59bc](https://github.com/fieldflow360/management-system/commit/b9b59bc1b38669ac37be791672dfdf40eecdb89a))
- created endpoints for task types - 86euuafek ([195aa17](https://github.com/fieldflow360/management-system/commit/195aa1785c1921271def31c2534acf67ae724fe4))
- created seat usage endpoint ([3735868](https://github.com/fieldflow360/management-system/commit/3735868a8afc521c04b7918d87ac94d590e430e2))
- **dashboard:** implement permission on dashboard page with run format ([#1104](https://github.com/fieldflow360/management-system/issues/1104)) ([d09d731](https://github.com/fieldflow360/management-system/commit/d09d731c587f966b941b1221d52fb8a25fb9a82e))
- enhance filtering options in TaskViewSet ([bf732ff](https://github.com/fieldflow360/management-system/commit/bf732ff4e973ca8bb016e8275635aa93723cc832))
- fix task filtering (single and multiple types and priorities) ([7fe6ec4](https://github.com/fieldflow360/management-system/commit/7fe6ec422ffe45a9125d472f0ca389cb72f3f713))
- **frontend:** bump version, changelog generation ([#1321](https://github.com/fieldflow360/management-system/issues/1321)) ([a84ed4f](https://github.com/fieldflow360/management-system/commit/a84ed4f2639b9f7b7038984b7adfc3f421c02c4b))
- **installed-footage:** Added permission check for admin & user on installed footage ([#1150](https://github.com/fieldflow360/management-system/issues/1150)) ([e97efdf](https://github.com/fieldflow360/management-system/commit/e97efdf44cda631ce396b8cbb77f7c37897cd6a8))
- **installed-footage:** Added permission check for admin & user on installed footage ([#1150](https://github.com/fieldflow360/management-system/issues/1150)) ([e7fb57d](https://github.com/fieldflow360/management-system/commit/e7fb57d2a1ffc280a80223bdf507f975ad2eef82))
- **jobs:** implement permission-based crew management for jobs ([#1101](https://github.com/fieldflow360/management-system/issues/1101)) ([05923e1](https://github.com/fieldflow360/management-system/commit/05923e1c9193a31cc4235dc0d0b13917efd25518))
- **jobs:** implement permission-based Edit/Delete functionality for jobs ([#1098](https://github.com/fieldflow360/management-system/issues/1098)) ([2382365](https://github.com/fieldflow360/management-system/commit/238236522668fe2609dd544d310eb10958719124))
- **jobs:** implement permission-based equipment assignment for jobs ([#1103](https://github.com/fieldflow360/management-system/issues/1103)) ([75e9c6b](https://github.com/fieldflow360/management-system/commit/75e9c6b24de07716524e359bebecceb42d2c9ac7))
- **jobs:** implement permission-based installed footage and installed risers ([#1105](https://github.com/fieldflow360/management-system/issues/1105)) ([3512134](https://github.com/fieldflow360/management-system/commit/3512134e3d015202dee0258c30d25fee479c7284))
- **jobs:** implement permission-based job status update ([#1100](https://github.com/fieldflow360/management-system/issues/1100)) ([655a8be](https://github.com/fieldflow360/management-system/commit/655a8bec68d6115f15466db6c7209c8fe4e410d4))
- **map:** hide client from map page if use don't have contact permission ([#1151](https://github.com/fieldflow360/management-system/issues/1151)) ([25426bc](https://github.com/fieldflow360/management-system/commit/25426bc0aff02420aba5971e2dafee6c3466dead))
- **map:** hide client from map page if use don't have contact permission ([#1151](https://github.com/fieldflow360/management-system/issues/1151)) ([71a7012](https://github.com/fieldflow360/management-system/commit/71a70126a369041e1cd2833b03355a005efb91a4))
- **map:** info for xml, kml ([#1235](https://github.com/fieldflow360/management-system/issues/1235)) ([8a4471e](https://github.com/fieldflow360/management-system/commit/8a4471eaa3dc9b718a3684009f165e377e289b17))
- **permissions:** add lead visibility permission controlled by admin ([#1074](https://github.com/fieldflow360/management-system/issues/1074)) ([d821c10](https://github.com/fieldflow360/management-system/commit/d821c100de995f49818ae8e39521c684b454148b))
- **permissions:** add permission-based visibility for Estimate and Financial tabs in Excavation/Tiling jobs ([#1079](https://github.com/fieldflow360/management-system/issues/1079)) ([58fe111](https://github.com/fieldflow360/management-system/commit/58fe11175638616c6183b0d126856b1006730323))
- **permissions:** add permission-based visibility for Excavation/Tiling/Repair jobs ([#1081](https://github.com/fieldflow360/management-system/issues/1081)) ([33b3978](https://github.com/fieldflow360/management-system/commit/33b3978c5d05d0d13cb439d3debf6e42c99a9230))
- **permissions:** add permission-based visibility for jobs tab ([#1082](https://github.com/fieldflow360/management-system/issues/1082)) ([2ee16f8](https://github.com/fieldflow360/management-system/commit/2ee16f8cc7f819bf88cb7a9c42c379ff7559c246))
- **permissions:** getResourcePermissions ([#1070](https://github.com/fieldflow360/management-system/issues/1070)) ([b87ac1c](https://github.com/fieldflow360/management-system/commit/b87ac1ca2d9866f518e961e8db2afbee864986b7))
- **permissions:** user permissions ([#1065](https://github.com/fieldflow360/management-system/issues/1065)) ([9864086](https://github.com/fieldflow360/management-system/commit/9864086d7c32d782af68710cf283c705e3f1e234))
- prevent renaming and deletion of default task types ([2db7065](https://github.com/fieldflow360/management-system/commit/2db7065877e0f82af56a890a33aea11b20e15d7e))
- **role perm editor:** warnings for Trash and CO&CA pages ([#1114](https://github.com/fieldflow360/management-system/issues/1114)) ([641eb4a](https://github.com/fieldflow360/management-system/commit/641eb4a5caeb749b1c949decb0949c0822996160))
- **roles:** full access for owner ([#1067](https://github.com/fieldflow360/management-system/issues/1067)) ([e544236](https://github.com/fieldflow360/management-system/commit/e54423605f622f3178deab31caf17a049fc11129))
- switched CorePointPermissionMixin to use HasPermission. ([41c7c94](https://github.com/fieldflow360/management-system/commit/41c7c944dce5f0792a7dfa9c0ad59db693d85c59))
- Switched EquipmentViewSetMixin, BatteryTypeViewSet, BatteryReplacementViewSet, to use HasPermission. ([024b540](https://github.com/fieldflow360/management-system/commit/024b5404eec82160a844327c5d25e710d250272e))
- **task-management:** implemented user task-management permissions in To Do page ([#1212](https://github.com/fieldflow360/management-system/issues/1212)) ([f566876](https://github.com/fieldflow360/management-system/commit/f56687668b8072437953fd5ee3b73fdbfcdd3f1c))
- **TaskManagementPage:** integrated hooks into task-management page ([#1207](https://github.com/fieldflow360/management-system/issues/1207)) ([ffa92ec](https://github.com/fieldflow360/management-system/commit/ffa92ecfaf99e83b3adcb56674f575c818e1ba8f))
- **team-management:** add ability for admin to create custom user types ([#1069](https://github.com/fieldflow360/management-system/issues/1069)) ([ca635f4](https://github.com/fieldflow360/management-system/commit/ca635f4c849fb097b646b9e3a751ea8a1a0b451c))
- **team-management:** add editable permissions for default roles ([#1056](https://github.com/fieldflow360/management-system/issues/1056)) ([53e8fd5](https://github.com/fieldflow360/management-system/commit/53e8fd555d99cc0f2c3588606d4c627613762131)), closes [#1058](https://github.com/fieldflow360/management-system/issues/1058)
- **team:** implement permission for todo list page with create his hook ([#1202](https://github.com/fieldflow360/management-system/issues/1202)) ([15da516](https://github.com/fieldflow360/management-system/commit/15da5160e90762d7a9e4af9b26a8797e424bcd38))
- **tiling:** implemented kml file upload & render ([#1234](https://github.com/fieldflow360/management-system/issues/1234)) ([0dc0dd7](https://github.com/fieldflow360/management-system/commit/0dc0dd7f2851f1c5819d46725f6a5a480fe38269))
- **useTask/types/statuses:** implemented necessary changes to task hooks and services to correctly integrate ([#1204](https://github.com/fieldflow360/management-system/issues/1204)) ([a405c46](https://github.com/fieldflow360/management-system/commit/a405c46d2c9b7cc89085e1a1214e5f311f96f38e))
- **useTasks/Types:** implemented useTasks and useTaskTypes hooks ([#1200](https://github.com/fieldflow360/management-system/issues/1200)) ([447961b](https://github.com/fieldflow360/management-system/commit/447961b47fc6a16856ce4fef30662797d950ec6e))
- **workflow:** add automated release deployment to development environment ([503160d](https://github.com/fieldflow360/management-system/commit/503160d29e3aaa84bc5fa15877be89a57caadb68))
- **workflow:** add automated release deployment to development environment ([df7d2a9](https://github.com/fieldflow360/management-system/commit/df7d2a95bb580756c698785619d3299689e7612c))

### Reverts

- Revert "remove rag/chroma_db" ([5568de9](https://github.com/fieldflow360/management-system/commit/5568de9791019062024a161877c260f172c46eaa))
- Revert "remove rag/chroma_db" ([5ce3d34](https://github.com/fieldflow360/management-system/commit/5ce3d3490073548addcdf148647fe538453c6b16))

# Changelog

All notable changes to the frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
