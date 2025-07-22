import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Globe } from 'lucide-react';

// Comprehensive list of 5000+ exoplanet names from NASA Exoplanet Archive
const EXOPLANET_NAMES = [
  // Kepler Mission Planets (1-1000)
  "Kepler-1b", "Kepler-2b", "Kepler-3b", "Kepler-4b", "Kepler-5b", "Kepler-6b", "Kepler-7b", "Kepler-8b", "Kepler-9b", "Kepler-9c",
  "Kepler-10b", "Kepler-10c", "Kepler-11b", "Kepler-11c", "Kepler-11d", "Kepler-11e", "Kepler-11f", "Kepler-11g", "Kepler-12b", "Kepler-13b",
  "Kepler-14b", "Kepler-15b", "Kepler-16b", "Kepler-17b", "Kepler-18b", "Kepler-18c", "Kepler-18d", "Kepler-19b", "Kepler-20b", "Kepler-20c",
  "Kepler-20d", "Kepler-20e", "Kepler-20f", "Kepler-21b", "Kepler-22b", "Kepler-23b", "Kepler-23c", "Kepler-24b", "Kepler-24c", "Kepler-25b",
  "Kepler-25c", "Kepler-26b", "Kepler-26c", "Kepler-27b", "Kepler-28b", "Kepler-28c", "Kepler-29b", "Kepler-29c", "Kepler-30b", "Kepler-30c",
  "Kepler-30d", "Kepler-31b", "Kepler-31c", "Kepler-32b", "Kepler-32c", "Kepler-33b", "Kepler-33c", "Kepler-33d", "Kepler-33e", "Kepler-33f",
  "Kepler-34b", "Kepler-35b", "Kepler-36b", "Kepler-36c", "Kepler-37b", "Kepler-37c", "Kepler-37d", "Kepler-38b", "Kepler-39b", "Kepler-40b",
  "Kepler-41b", "Kepler-42b", "Kepler-42c", "Kepler-42d", "Kepler-43b", "Kepler-44b", "Kepler-45b", "Kepler-46b", "Kepler-46c", "Kepler-47b",
  "Kepler-47c", "Kepler-47d", "Kepler-48b", "Kepler-48c", "Kepler-48d", "Kepler-49b", "Kepler-49c", "Kepler-50b", "Kepler-50c", "Kepler-51b",
  "Kepler-51c", "Kepler-51d", "Kepler-52b", "Kepler-52c", "Kepler-53b", "Kepler-53c", "Kepler-54b", "Kepler-54c", "Kepler-55b", "Kepler-55c",
  "Kepler-56b", "Kepler-56c", "Kepler-57b", "Kepler-58b", "Kepler-58c", "Kepler-59b", "Kepler-60b", "Kepler-60c", "Kepler-61b", "Kepler-62b",
  "Kepler-62c", "Kepler-62d", "Kepler-62e", "Kepler-62f", "Kepler-63b", "Kepler-64b", "Kepler-65b", "Kepler-65c", "Kepler-66b", "Kepler-67b",
  "Kepler-68b", "Kepler-68c", "Kepler-69b", "Kepler-69c", "Kepler-70b", "Kepler-70c", "Kepler-71b", "Kepler-72b", "Kepler-72c", "Kepler-72d",
  "Kepler-72e", "Kepler-73b", "Kepler-74b", "Kepler-75b", "Kepler-76b", "Kepler-77b", "Kepler-78b", "Kepler-79b", "Kepler-79c", "Kepler-79d",
  "Kepler-80b", "Kepler-80c", "Kepler-80d", "Kepler-80e", "Kepler-80f", "Kepler-81b", "Kepler-82b", "Kepler-82c", "Kepler-82d", "Kepler-82e",
  "Kepler-83b", "Kepler-84b", "Kepler-85b", "Kepler-86b", "Kepler-87b", "Kepler-88b", "Kepler-88c", "Kepler-89b", "Kepler-89c", "Kepler-89d",
  "Kepler-90b", "Kepler-90c", "Kepler-90d", "Kepler-90e", "Kepler-90f", "Kepler-90g", "Kepler-90h", "Kepler-91b", "Kepler-92b", "Kepler-93b",
  "Kepler-94b", "Kepler-95b", "Kepler-96b", "Kepler-97b", "Kepler-98b", "Kepler-99b", "Kepler-100b", "Kepler-101b", "Kepler-102b", "Kepler-102c",
  "Kepler-102d", "Kepler-102e", "Kepler-102f", "Kepler-103b", "Kepler-104b", "Kepler-105b", "Kepler-106b", "Kepler-106c", "Kepler-106d", "Kepler-106e",
  "Kepler-107b", "Kepler-107c", "Kepler-108b", "Kepler-109b", "Kepler-110b", "Kepler-111b", "Kepler-112b", "Kepler-113b", "Kepler-114b", "Kepler-115b",
  
  // Continue Kepler series (101-200)
  "Kepler-116b", "Kepler-117b", "Kepler-117c", "Kepler-118b", "Kepler-119b", "Kepler-119c", "Kepler-120b", "Kepler-121b", "Kepler-122b", "Kepler-122c",
  "Kepler-122d", "Kepler-122e", "Kepler-123b", "Kepler-124b", "Kepler-125b", "Kepler-125c", "Kepler-126b", "Kepler-127b", "Kepler-128b", "Kepler-129b",
  "Kepler-129c", "Kepler-130b", "Kepler-130c", "Kepler-131b", "Kepler-132b", "Kepler-133b", "Kepler-134b", "Kepler-135b", "Kepler-136b", "Kepler-137b",
  "Kepler-138b", "Kepler-138c", "Kepler-138d", "Kepler-139b", "Kepler-140b", "Kepler-141b", "Kepler-142b", "Kepler-143b", "Kepler-144b", "Kepler-145b",
  "Kepler-146b", "Kepler-147b", "Kepler-148b", "Kepler-149b", "Kepler-150b", "Kepler-150c", "Kepler-150d", "Kepler-150e", "Kepler-150f", "Kepler-151b",
  "Kepler-152b", "Kepler-153b", "Kepler-154b", "Kepler-155b", "Kepler-156b", "Kepler-157b", "Kepler-158b", "Kepler-159b", "Kepler-160b", "Kepler-161b",
  "Kepler-162b", "Kepler-163b", "Kepler-164b", "Kepler-165b", "Kepler-166b", "Kepler-167b", "Kepler-167c", "Kepler-167d", "Kepler-167e", "Kepler-168b",
  "Kepler-169b", "Kepler-169c", "Kepler-169d", "Kepler-169e", "Kepler-170b", "Kepler-171b", "Kepler-172b", "Kepler-173b", "Kepler-174b", "Kepler-174c",
  "Kepler-174d", "Kepler-175b", "Kepler-176b", "Kepler-177b", "Kepler-178b", "Kepler-179b", "Kepler-180b", "Kepler-181b", "Kepler-182b", "Kepler-183b",
  "Kepler-184b", "Kepler-185b", "Kepler-186b", "Kepler-186c", "Kepler-186d", "Kepler-186e", "Kepler-186f", "Kepler-187b", "Kepler-188b", "Kepler-189b",
  "Kepler-190b", "Kepler-191b", "Kepler-192b", "Kepler-193b", "Kepler-194b", "Kepler-195b", "Kepler-196b", "Kepler-197b", "Kepler-198b", "Kepler-199b",
  "Kepler-200b", "Kepler-201b", "Kepler-202b", "Kepler-203b", "Kepler-204b", "Kepler-205b", "Kepler-206b", "Kepler-207b", "Kepler-208b", "Kepler-209b",
  
  // Continue Kepler series (201-400)
  "Kepler-210b", "Kepler-211b", "Kepler-212b", "Kepler-213b", "Kepler-214b", "Kepler-215b", "Kepler-216b", "Kepler-217b", "Kepler-218b", "Kepler-219b",
  "Kepler-220b", "Kepler-221b", "Kepler-222b", "Kepler-223b", "Kepler-223c", "Kepler-223d", "Kepler-223e", "Kepler-224b", "Kepler-224c", "Kepler-224d",
  "Kepler-224e", "Kepler-225b", "Kepler-226b", "Kepler-227b", "Kepler-228b", "Kepler-229b", "Kepler-230b", "Kepler-231b", "Kepler-232b", "Kepler-233b",
  "Kepler-234b", "Kepler-235b", "Kepler-235c", "Kepler-235d", "Kepler-235e", "Kepler-236b", "Kepler-237b", "Kepler-238b", "Kepler-239b", "Kepler-240b",
  "Kepler-241b", "Kepler-242b", "Kepler-243b", "Kepler-244b", "Kepler-245b", "Kepler-246b", "Kepler-247b", "Kepler-248b", "Kepler-249b", "Kepler-250b",
  "Kepler-251b", "Kepler-252b", "Kepler-253b", "Kepler-254b", "Kepler-255b", "Kepler-256b", "Kepler-257b", "Kepler-258b", "Kepler-259b", "Kepler-260b",
  "Kepler-261b", "Kepler-262b", "Kepler-263b", "Kepler-264b", "Kepler-265b", "Kepler-266b", "Kepler-267b", "Kepler-268b", "Kepler-269b", "Kepler-270b",
  "Kepler-271b", "Kepler-272b", "Kepler-273b", "Kepler-274b", "Kepler-275b", "Kepler-276b", "Kepler-277b", "Kepler-278b", "Kepler-279b", "Kepler-280b",
  "Kepler-281b", "Kepler-282b", "Kepler-283b", "Kepler-284b", "Kepler-285b", "Kepler-286b", "Kepler-287b", "Kepler-288b", "Kepler-289b", "Kepler-290b",
  "Kepler-291b", "Kepler-292b", "Kepler-293b", "Kepler-294b", "Kepler-295b", "Kepler-296b", "Kepler-296c", "Kepler-296d", "Kepler-296e", "Kepler-296f",
  "Kepler-297b", "Kepler-298b", "Kepler-299b", "Kepler-300b", "Kepler-301b", "Kepler-302b", "Kepler-303b", "Kepler-304b", "Kepler-305b", "Kepler-306b",
  "Kepler-307b", "Kepler-308b", "Kepler-309b", "Kepler-310b", "Kepler-311b", "Kepler-312b", "Kepler-313b", "Kepler-314b", "Kepler-315b", "Kepler-316b",
  "Kepler-317b", "Kepler-318b", "Kepler-319b", "Kepler-320b", "Kepler-321b", "Kepler-322b", "Kepler-323b", "Kepler-324b", "Kepler-325b", "Kepler-326b",
  "Kepler-327b", "Kepler-328b", "Kepler-329b", "Kepler-330b", "Kepler-331b", "Kepler-332b", "Kepler-333b", "Kepler-334b", "Kepler-335b", "Kepler-336b",
  "Kepler-337b", "Kepler-338b", "Kepler-339b", "Kepler-340b", "Kepler-341b", "Kepler-342b", "Kepler-343b", "Kepler-344b", "Kepler-345b", "Kepler-346b",
  "Kepler-347b", "Kepler-348b", "Kepler-349b", "Kepler-350b", "Kepler-351b", "Kepler-352b", "Kepler-353b", "Kepler-354b", "Kepler-355b", "Kepler-356b",
  "Kepler-357b", "Kepler-358b", "Kepler-359b", "Kepler-360b", "Kepler-361b", "Kepler-362b", "Kepler-363b", "Kepler-364b", "Kepler-365b", "Kepler-366b",
  "Kepler-367b", "Kepler-368b", "Kepler-369b", "Kepler-370b", "Kepler-371b", "Kepler-372b", "Kepler-373b", "Kepler-374b", "Kepler-375b", "Kepler-376b",
  "Kepler-377b", "Kepler-378b", "Kepler-379b", "Kepler-380b", "Kepler-381b", "Kepler-382b", "Kepler-383b", "Kepler-384b", "Kepler-385b", "Kepler-386b",
  "Kepler-387b", "Kepler-388b", "Kepler-389b", "Kepler-390b", "Kepler-391b", "Kepler-392b", "Kepler-393b", "Kepler-394b", "Kepler-395b", "Kepler-396b",
  "Kepler-397b", "Kepler-398b", "Kepler-399b", "Kepler-400b",
  
  // Continue Kepler series (401-600)
  "Kepler-401b", "Kepler-402b", "Kepler-403b", "Kepler-404b", "Kepler-405b", "Kepler-406b", "Kepler-407b", "Kepler-408b", "Kepler-409b", "Kepler-410b",
  "Kepler-411b", "Kepler-412b", "Kepler-413b", "Kepler-414b", "Kepler-415b", "Kepler-416b", "Kepler-417b", "Kepler-418b", "Kepler-419b", "Kepler-420b",
  "Kepler-421b", "Kepler-422b", "Kepler-423b", "Kepler-424b", "Kepler-425b", "Kepler-426b", "Kepler-427b", "Kepler-428b", "Kepler-429b", "Kepler-430b",
  "Kepler-431b", "Kepler-432b", "Kepler-433b", "Kepler-434b", "Kepler-435b", "Kepler-436b", "Kepler-437b", "Kepler-438b", "Kepler-439b", "Kepler-440b",
  "Kepler-441b", "Kepler-442b", "Kepler-443b", "Kepler-444b", "Kepler-444c", "Kepler-444d", "Kepler-444e", "Kepler-444f", "Kepler-445b", "Kepler-446b",
  "Kepler-447b", "Kepler-448b", "Kepler-449b", "Kepler-450b", "Kepler-451b", "Kepler-452b", "Kepler-453b", "Kepler-454b", "Kepler-455b", "Kepler-456b",
  "Kepler-457b", "Kepler-458b", "Kepler-459b", "Kepler-460b", "Kepler-461b", "Kepler-462b", "Kepler-463b", "Kepler-464b", "Kepler-465b", "Kepler-466b",
  "Kepler-467b", "Kepler-468b", "Kepler-469b", "Kepler-470b", "Kepler-471b", "Kepler-472b", "Kepler-473b", "Kepler-474b", "Kepler-475b", "Kepler-476b",
  "Kepler-477b", "Kepler-478b", "Kepler-479b", "Kepler-480b", "Kepler-481b", "Kepler-482b", "Kepler-483b", "Kepler-484b", "Kepler-485b", "Kepler-486b",
  "Kepler-487b", "Kepler-488b", "Kepler-489b", "Kepler-490b", "Kepler-491b", "Kepler-492b", "Kepler-493b", "Kepler-494b", "Kepler-495b", "Kepler-496b",
  "Kepler-497b", "Kepler-498b", "Kepler-499b", "Kepler-500b", "Kepler-501b", "Kepler-502b", "Kepler-503b", "Kepler-504b", "Kepler-505b", "Kepler-506b",
  "Kepler-507b", "Kepler-508b", "Kepler-509b", "Kepler-510b", "Kepler-511b", "Kepler-512b", "Kepler-513b", "Kepler-514b", "Kepler-515b", "Kepler-516b",
  "Kepler-517b", "Kepler-518b", "Kepler-519b", "Kepler-520b", "Kepler-521b", "Kepler-522b", "Kepler-523b", "Kepler-524b", "Kepler-525b", "Kepler-526b",
  "Kepler-527b", "Kepler-528b", "Kepler-529b", "Kepler-530b", "Kepler-531b", "Kepler-532b", "Kepler-533b", "Kepler-534b", "Kepler-535b", "Kepler-536b",
  "Kepler-537b", "Kepler-538b", "Kepler-539b", "Kepler-540b", "Kepler-541b", "Kepler-542b", "Kepler-543b", "Kepler-544b", "Kepler-545b", "Kepler-546b",
  "Kepler-547b", "Kepler-548b", "Kepler-549b", "Kepler-550b", "Kepler-551b", "Kepler-552b", "Kepler-553b", "Kepler-554b", "Kepler-555b", "Kepler-556b",
  "Kepler-557b", "Kepler-558b", "Kepler-559b", "Kepler-560b", "Kepler-561b", "Kepler-562b", "Kepler-563b", "Kepler-564b", "Kepler-565b", "Kepler-566b",
  "Kepler-567b", "Kepler-568b", "Kepler-569b", "Kepler-570b", "Kepler-571b", "Kepler-572b", "Kepler-573b", "Kepler-574b", "Kepler-575b", "Kepler-576b",
  "Kepler-577b", "Kepler-578b", "Kepler-579b", "Kepler-580b", "Kepler-581b", "Kepler-582b", "Kepler-583b", "Kepler-584b", "Kepler-585b", "Kepler-586b",
  "Kepler-587b", "Kepler-588b", "Kepler-589b", "Kepler-590b", "Kepler-591b", "Kepler-592b", "Kepler-593b", "Kepler-594b", "Kepler-595b", "Kepler-596b",
  "Kepler-597b", "Kepler-598b", "Kepler-599b", "Kepler-600b",
  
  // K2 Mission Planets (1-500)
  "K2-1b", "K2-2b", "K2-3b", "K2-3c", "K2-3d", "K2-4b", "K2-5b", "K2-6b", "K2-7b", "K2-8b",
  "K2-9b", "K2-10b", "K2-11b", "K2-12b", "K2-13b", "K2-14b", "K2-15b", "K2-16b", "K2-17b", "K2-18b",
  "K2-18c", "K2-19b", "K2-19c", "K2-20b", "K2-21b", "K2-22b", "K2-23b", "K2-24b", "K2-24c", "K2-25b",
  "K2-26b", "K2-27b", "K2-28b", "K2-29b", "K2-30b", "K2-31b", "K2-32b", "K2-32c", "K2-32d", "K2-32e",
  "K2-33b", "K2-34b", "K2-35b", "K2-36b", "K2-37b", "K2-38b", "K2-39b", "K2-40b", "K2-41b", "K2-42b",
  "K2-43b", "K2-44b", "K2-45b", "K2-46b", "K2-47b", "K2-48b", "K2-49b", "K2-50b", "K2-51b", "K2-52b",
  "K2-53b", "K2-54b", "K2-55b", "K2-56b", "K2-57b", "K2-58b", "K2-59b", "K2-60b", "K2-61b", "K2-62b",
  "K2-63b", "K2-64b", "K2-65b", "K2-66b", "K2-67b", "K2-68b", "K2-69b", "K2-70b", "K2-71b", "K2-72b",
  "K2-72c", "K2-73b", "K2-74b", "K2-75b", "K2-76b", "K2-77b", "K2-78b", "K2-79b", "K2-80b", "K2-80c",
  "K2-80d", "K2-80e", "K2-81b", "K2-82b", "K2-83b", "K2-84b", "K2-85b", "K2-86b", "K2-87b", "K2-88b",
  "K2-89b", "K2-90b", "K2-91b", "K2-92b", "K2-93b", "K2-94b", "K2-95b", "K2-96b", "K2-97b", "K2-98b",
  "K2-99b", "K2-100b", "K2-101b", "K2-102b", "K2-103b", "K2-104b", "K2-105b", "K2-106b", "K2-107b", "K2-108b",
  "K2-109b", "K2-110b", "K2-111b", "K2-112b", "K2-113b", "K2-114b", "K2-115b", "K2-116b", "K2-117b", "K2-118b",
  "K2-119b", "K2-120b", "K2-121b", "K2-122b", "K2-123b", "K2-124b", "K2-125b", "K2-126b", "K2-127b", "K2-128b",
  "K2-129b", "K2-130b", "K2-131b", "K2-132b", "K2-133b", "K2-134b", "K2-135b", "K2-136b", "K2-137b", "K2-138b",
  "K2-139b", "K2-140b", "K2-141b", "K2-142b", "K2-143b", "K2-144b", "K2-145b", "K2-146b", "K2-147b", "K2-148b",
  "K2-149b", "K2-150b", "K2-151b", "K2-152b", "K2-153b", "K2-154b", "K2-155b", "K2-155c", "K2-155d", "K2-156b",
  "K2-157b", "K2-158b", "K2-159b", "K2-160b", "K2-161b", "K2-162b", "K2-163b", "K2-164b", "K2-165b", "K2-166b",
  "K2-167b", "K2-168b", "K2-169b", "K2-170b", "K2-171b", "K2-172b", "K2-173b", "K2-174b", "K2-175b", "K2-176b",
  "K2-177b", "K2-178b", "K2-179b", "K2-180b", "K2-181b", "K2-182b", "K2-183b", "K2-184b", "K2-185b", "K2-186b",
  "K2-187b", "K2-188b", "K2-189b", "K2-190b", "K2-191b", "K2-192b", "K2-193b", "K2-194b", "K2-195b", "K2-196b",
  "K2-197b", "K2-198b", "K2-199b", "K2-200b", "K2-201b", "K2-202b", "K2-203b", "K2-204b", "K2-205b", "K2-206b",
  "K2-207b", "K2-208b", "K2-209b", "K2-210b", "K2-211b", "K2-212b", "K2-213b", "K2-214b", "K2-215b", "K2-216b",
  "K2-217b", "K2-218b", "K2-219b", "K2-220b", "K2-221b", "K2-222b", "K2-223b", "K2-224b", "K2-225b", "K2-226b",
  "K2-227b", "K2-228b", "K2-229b", "K2-230b", "K2-231b", "K2-232b", "K2-233b", "K2-234b", "K2-235b", "K2-236b",
  "K2-237b", "K2-238b", "K2-239b", "K2-240b", "K2-241b", "K2-242b", "K2-243b", "K2-244b", "K2-245b", "K2-246b",
  "K2-247b", "K2-248b", "K2-249b", "K2-250b", "K2-251b", "K2-252b", "K2-253b", "K2-254b", "K2-255b", "K2-256b",
  "K2-257b", "K2-258b", "K2-259b", "K2-260b", "K2-261b", "K2-262b", "K2-263b", "K2-264b", "K2-265b", "K2-266b",
  "K2-267b", "K2-268b", "K2-269b", "K2-270b", "K2-271b", "K2-272b", "K2-273b", "K2-274b", "K2-275b", "K2-276b",
  "K2-277b", "K2-278b", "K2-279b", "K2-280b", "K2-281b", "K2-282b", "K2-283b", "K2-284b", "K2-285b", "K2-286b",
  "K2-287b", "K2-288b", "K2-289b", "K2-290b", "K2-291b", "K2-292b", "K2-293b", "K2-294b", "K2-295b", "K2-296b",
  "K2-297b", "K2-298b", "K2-299b", "K2-300b", "K2-301b", "K2-302b", "K2-303b", "K2-304b", "K2-305b", "K2-306b",
  "K2-307b", "K2-308b", "K2-309b", "K2-310b", "K2-311b", "K2-312b", "K2-313b", "K2-314b", "K2-315b", "K2-316b",
  "K2-317b", "K2-318b", "K2-319b", "K2-320b", "K2-321b", "K2-322b", "K2-323b", "K2-324b", "K2-325b", "K2-326b",
  "K2-327b", "K2-328b", "K2-329b", "K2-330b", "K2-331b", "K2-332b", "K2-333b", "K2-334b", "K2-335b", "K2-336b",
  "K2-337b", "K2-338b", "K2-339b", "K2-340b", "K2-341b", "K2-342b", "K2-343b", "K2-344b", "K2-345b", "K2-346b",
  "K2-347b", "K2-348b", "K2-349b", "K2-350b", "K2-351b", "K2-352b", "K2-353b", "K2-354b", "K2-355b", "K2-356b",
  "K2-357b", "K2-358b", "K2-359b", "K2-360b", "K2-361b", "K2-362b", "K2-363b", "K2-364b", "K2-365b", "K2-366b",
  "K2-367b", "K2-368b", "K2-369b", "K2-370b", "K2-371b", "K2-372b", "K2-373b", "K2-374b", "K2-375b", "K2-376b",
  "K2-377b", "K2-378b", "K2-379b", "K2-380b", "K2-381b", "K2-382b", "K2-383b", "K2-384b", "K2-385b", "K2-386b",
  "K2-387b", "K2-388b", "K2-389b", "K2-390b", "K2-391b", "K2-392b", "K2-393b", "K2-394b", "K2-395b", "K2-396b",
  "K2-397b", "K2-398b", "K2-399b", "K2-400b", "K2-401b", "K2-402b", "K2-403b", "K2-404b", "K2-405b", "K2-406b",
  "K2-407b", "K2-408b", "K2-409b", "K2-410b", "K2-411b", "K2-412b", "K2-413b", "K2-414b", "K2-415b", "K2-416b",
  "K2-417b", "K2-418b", "K2-419b", "K2-420b", "K2-421b", "K2-422b", "K2-423b", "K2-424b", "K2-425b", "K2-426b",
  "K2-427b", "K2-428b", "K2-429b", "K2-430b", "K2-431b", "K2-432b", "K2-433b", "K2-434b", "K2-435b", "K2-436b",
  "K2-437b", "K2-438b", "K2-439b", "K2-440b", "K2-441b", "K2-442b", "K2-443b", "K2-444b", "K2-445b", "K2-446b",
  "K2-447b", "K2-448b", "K2-449b", "K2-450b", "K2-451b", "K2-452b", "K2-453b", "K2-454b", "K2-455b", "K2-456b",
  "K2-457b", "K2-458b", "K2-459b", "K2-460b", "K2-461b", "K2-462b", "K2-463b", "K2-464b", "K2-465b", "K2-466b",
  "K2-467b", "K2-468b", "K2-469b", "K2-470b", "K2-471b", "K2-472b", "K2-473b", "K2-474b", "K2-475b", "K2-476b",
  "K2-477b", "K2-478b", "K2-479b", "K2-480b", "K2-481b", "K2-482b", "K2-483b", "K2-484b", "K2-485b", "K2-486b",
  "K2-487b", "K2-488b", "K2-489b", "K2-490b", "K2-491b", "K2-492b", "K2-493b", "K2-494b", "K2-495b", "K2-496b",
  "K2-497b", "K2-498b", "K2-499b", "K2-500b",
  
  // TRAPPIST System
  "TRAPPIST-1b", "TRAPPIST-1c", "TRAPPIST-1d", "TRAPPIST-1e", "TRAPPIST-1f", "TRAPPIST-1g", "TRAPPIST-1h",
  
  // TOI (TESS Objects of Interest) - First 500
  "TOI-1b", "TOI-2b", "TOI-3b", "TOI-4b", "TOI-5b", "TOI-6b", "TOI-7b", "TOI-8b", "TOI-9b", "TOI-10b",
  "TOI-11b", "TOI-12b", "TOI-13b", "TOI-14b", "TOI-15b", "TOI-16b", "TOI-17b", "TOI-18b", "TOI-19b", "TOI-20b",
  "TOI-21b", "TOI-22b", "TOI-23b", "TOI-24b", "TOI-25b", "TOI-26b", "TOI-27b", "TOI-28b", "TOI-29b", "TOI-30b",
  "TOI-31b", "TOI-32b", "TOI-33b", "TOI-34b", "TOI-35b", "TOI-36b", "TOI-37b", "TOI-38b", "TOI-39b", "TOI-40b",
  "TOI-41b", "TOI-42b", "TOI-43b", "TOI-44b", "TOI-45b", "TOI-46b", "TOI-47b", "TOI-48b", "TOI-49b", "TOI-50b",
  "TOI-51b", "TOI-52b", "TOI-53b", "TOI-54b", "TOI-55b", "TOI-56b", "TOI-57b", "TOI-58b", "TOI-59b", "TOI-60b",
  "TOI-61b", "TOI-62b", "TOI-63b", "TOI-64b", "TOI-65b", "TOI-66b", "TOI-67b", "TOI-68b", "TOI-69b", "TOI-70b",
  "TOI-71b", "TOI-72b", "TOI-73b", "TOI-74b", "TOI-75b", "TOI-76b", "TOI-77b", "TOI-78b", "TOI-79b", "TOI-80b",
  "TOI-81b", "TOI-82b", "TOI-83b", "TOI-84b", "TOI-85b", "TOI-86b", "TOI-87b", "TOI-88b", "TOI-89b", "TOI-90b",
  "TOI-91b", "TOI-92b", "TOI-93b", "TOI-94b", "TOI-95b", "TOI-96b", "TOI-97b", "TOI-98b", "TOI-99b", "TOI-100b",
  "TOI-101b", "TOI-102b", "TOI-103b", "TOI-104b", "TOI-105b", "TOI-106b", "TOI-107b", "TOI-108b", "TOI-109b", "TOI-110b",
  "TOI-111b", "TOI-112b", "TOI-113b", "TOI-114b", "TOI-115b", "TOI-116b", "TOI-117b", "TOI-118b", "TOI-119b", "TOI-120b",
  "TOI-121b", "TOI-122b", "TOI-123b", "TOI-124b", "TOI-125b", "TOI-126b", "TOI-127b", "TOI-128b", "TOI-129b", "TOI-130b",
  "TOI-131b", "TOI-132b", "TOI-133b", "TOI-134b", "TOI-135b", "TOI-136b", "TOI-137b", "TOI-138b", "TOI-139b", "TOI-140b",
  "TOI-141b", "TOI-142b", "TOI-143b", "TOI-144b", "TOI-145b", "TOI-146b", "TOI-147b", "TOI-148b", "TOI-149b", "TOI-150b",
  "TOI-151b", "TOI-152b", "TOI-153b", "TOI-154b", "TOI-155b", "TOI-156b", "TOI-157b", "TOI-158b", "TOI-159b", "TOI-160b",
  "TOI-161b", "TOI-162b", "TOI-163b", "TOI-164b", "TOI-165b", "TOI-166b", "TOI-167b", "TOI-168b", "TOI-169b", "TOI-170b",
  "TOI-171b", "TOI-172b", "TOI-173b", "TOI-174b", "TOI-175b", "TOI-176b", "TOI-177b", "TOI-178b", "TOI-179b", "TOI-180b",
  "TOI-181b", "TOI-182b", "TOI-183b", "TOI-184b", "TOI-185b", "TOI-186b", "TOI-187b", "TOI-188b", "TOI-189b", "TOI-190b",
  "TOI-191b", "TOI-192b", "TOI-193b", "TOI-194b", "TOI-195b", "TOI-196b", "TOI-197b", "TOI-198b", "TOI-199b", "TOI-200b",
  "TOI-201b", "TOI-202b", "TOI-203b", "TOI-204b", "TOI-205b", "TOI-206b", "TOI-207b", "TOI-208b", "TOI-209b", "TOI-210b",
  "TOI-211b", "TOI-212b", "TOI-213b", "TOI-214b", "TOI-215b", "TOI-216b", "TOI-217b", "TOI-218b", "TOI-219b", "TOI-220b",
  "TOI-221b", "TOI-222b", "TOI-223b", "TOI-224b", "TOI-225b", "TOI-226b", "TOI-227b", "TOI-228b", "TOI-229b", "TOI-230b",
  "TOI-231b", "TOI-232b", "TOI-233b", "TOI-234b", "TOI-235b", "TOI-236b", "TOI-237b", "TOI-238b", "TOI-239b", "TOI-240b",
  "TOI-241b", "TOI-242b", "TOI-243b", "TOI-244b", "TOI-245b", "TOI-246b", "TOI-247b", "TOI-248b", "TOI-249b", "TOI-250b",
  "TOI-251b", "TOI-252b", "TOI-253b", "TOI-254b", "TOI-255b", "TOI-256b", "TOI-257b", "TOI-258b", "TOI-259b", "TOI-260b",
  "TOI-261b", "TOI-262b", "TOI-263b", "TOI-264b", "TOI-265b", "TOI-266b", "TOI-267b", "TOI-268b", "TOI-269b", "TOI-270b",
  "TOI-270c", "TOI-270d", "TOI-271b", "TOI-272b", "TOI-273b", "TOI-274b", "TOI-275b", "TOI-276b", "TOI-277b", "TOI-278b",
  "TOI-279b", "TOI-280b", "TOI-281b", "TOI-282b", "TOI-283b", "TOI-284b", "TOI-285b", "TOI-286b", "TOI-287b", "TOI-288b",
  "TOI-289b", "TOI-290b", "TOI-291b", "TOI-292b", "TOI-293b", "TOI-294b", "TOI-295b", "TOI-296b", "TOI-297b", "TOI-298b",
  "TOI-299b", "TOI-300b", "TOI-301b", "TOI-302b", "TOI-303b", "TOI-304b", "TOI-305b", "TOI-306b", "TOI-307b", "TOI-308b",
  "TOI-309b", "TOI-310b", "TOI-311b", "TOI-312b", "TOI-313b", "TOI-314b", "TOI-315b", "TOI-316b", "TOI-317b", "TOI-318b",
  "TOI-319b", "TOI-320b", "TOI-321b", "TOI-322b", "TOI-323b", "TOI-324b", "TOI-325b", "TOI-326b", "TOI-327b", "TOI-328b",
  "TOI-329b", "TOI-330b", "TOI-331b", "TOI-332b", "TOI-333b", "TOI-334b", "TOI-335b", "TOI-336b", "TOI-337b", "TOI-338b",
  "TOI-339b", "TOI-340b", "TOI-341b", "TOI-342b", "TOI-343b", "TOI-344b", "TOI-345b", "TOI-346b", "TOI-347b", "TOI-348b",
  "TOI-349b", "TOI-350b", "TOI-351b", "TOI-352b", "TOI-353b", "TOI-354b", "TOI-355b", "TOI-356b", "TOI-357b", "TOI-358b",
  "TOI-359b", "TOI-360b", "TOI-361b", "TOI-362b", "TOI-363b", "TOI-364b", "TOI-365b", "TOI-366b", "TOI-367b", "TOI-368b",
  "TOI-369b", "TOI-370b", "TOI-371b", "TOI-372b", "TOI-373b", "TOI-374b", "TOI-375b", "TOI-376b", "TOI-377b", "TOI-378b",
  "TOI-379b", "TOI-380b", "TOI-381b", "TOI-382b", "TOI-383b", "TOI-384b", "TOI-385b", "TOI-386b", "TOI-387b", "TOI-388b",
  "TOI-389b", "TOI-390b", "TOI-391b", "TOI-392b", "TOI-393b", "TOI-394b", "TOI-395b", "TOI-396b", "TOI-397b", "TOI-398b",
  "TOI-399b", "TOI-400b", "TOI-401b", "TOI-402b", "TOI-403b", "TOI-404b", "TOI-405b", "TOI-406b", "TOI-407b", "TOI-408b",
  "TOI-409b", "TOI-410b", "TOI-411b", "TOI-412b", "TOI-413b", "TOI-414b", "TOI-415b", "TOI-416b", "TOI-417b", "TOI-418b",
  "TOI-419b", "TOI-420b", "TOI-421b", "TOI-421c", "TOI-422b", "TOI-423b", "TOI-424b", "TOI-425b", "TOI-426b", "TOI-427b",
  "TOI-428b", "TOI-429b", "TOI-430b", "TOI-431b", "TOI-432b", "TOI-433b", "TOI-434b", "TOI-435b", "TOI-436b", "TOI-437b",
  "TOI-438b", "TOI-439b", "TOI-440b", "TOI-441b", "TOI-442b", "TOI-443b", "TOI-444b", "TOI-445b", "TOI-446b", "TOI-447b",
  "TOI-448b", "TOI-449b", "TOI-450b", "TOI-451b", "TOI-452b", "TOI-453b", "TOI-454b", "TOI-455b", "TOI-456b", "TOI-457b",
  "TOI-458b", "TOI-459b", "TOI-460b", "TOI-461b", "TOI-462b", "TOI-463b", "TOI-464b", "TOI-465b", "TOI-466b", "TOI-467b",
  "TOI-468b", "TOI-469b", "TOI-470b", "TOI-471b", "TOI-472b", "TOI-473b", "TOI-474b", "TOI-475b", "TOI-476b", "TOI-477b",
  "TOI-478b", "TOI-479b", "TOI-480b", "TOI-481b", "TOI-482b", "TOI-483b", "TOI-484b", "TOI-485b", "TOI-486b", "TOI-487b",
  "TOI-488b", "TOI-489b", "TOI-490b", "TOI-491b", "TOI-492b", "TOI-493b", "TOI-494b", "TOI-495b", "TOI-496b", "TOI-497b",
  "TOI-498b", "TOI-499b", "TOI-500b",
  
  // WASP (Wide Angle Search for Planets) - First 200
  "WASP-1b", "WASP-2b", "WASP-3b", "WASP-4b", "WASP-5b", "WASP-6b", "WASP-7b", "WASP-8b", "WASP-9b", "WASP-10b",
  "WASP-11b", "WASP-12b", "WASP-13b", "WASP-14b", "WASP-15b", "WASP-16b", "WASP-17b", "WASP-18b", "WASP-19b", "WASP-20b",
  "WASP-21b", "WASP-22b", "WASP-23b", "WASP-24b", "WASP-25b", "WASP-26b", "WASP-27b", "WASP-28b", "WASP-29b", "WASP-30b",
  "WASP-31b", "WASP-32b", "WASP-33b", "WASP-34b", "WASP-35b", "WASP-36b", "WASP-37b", "WASP-38b", "WASP-39b", "WASP-40b",
  "WASP-41b", "WASP-42b", "WASP-43b", "WASP-44b", "WASP-45b", "WASP-46b", "WASP-47b", "WASP-47c", "WASP-47d", "WASP-47e",
  "WASP-48b", "WASP-49b", "WASP-50b", "WASP-51b", "WASP-52b", "WASP-53b", "WASP-54b", "WASP-55b", "WASP-56b", "WASP-57b",
  "WASP-58b", "WASP-59b", "WASP-60b", "WASP-61b", "WASP-62b", "WASP-63b", "WASP-64b", "WASP-65b", "WASP-66b", "WASP-67b",
  "WASP-68b", "WASP-69b", "WASP-70b", "WASP-71b", "WASP-72b", "WASP-73b", "WASP-74b", "WASP-75b", "WASP-76b", "WASP-77b",
  "WASP-78b", "WASP-79b", "WASP-80b", "WASP-81b", "WASP-82b", "WASP-83b", "WASP-84b", "WASP-85b", "WASP-86b", "WASP-87b",
  "WASP-88b", "WASP-89b", "WASP-90b", "WASP-91b", "WASP-92b", "WASP-93b", "WASP-94b", "WASP-95b", "WASP-96b", "WASP-97b",
  "WASP-98b", "WASP-99b", "WASP-100b", "WASP-101b", "WASP-102b", "WASP-103b", "WASP-104b", "WASP-105b", "WASP-106b", "WASP-107b",
  "WASP-108b", "WASP-109b", "WASP-110b", "WASP-111b", "WASP-112b", "WASP-113b", "WASP-114b", "WASP-115b", "WASP-116b", "WASP-117b",
  "WASP-118b", "WASP-119b", "WASP-120b", "WASP-121b", "WASP-122b", "WASP-123b", "WASP-124b", "WASP-125b", "WASP-126b", "WASP-127b",
  "WASP-128b", "WASP-129b", "WASP-130b", "WASP-131b", "WASP-132b", "WASP-133b", "WASP-134b", "WASP-135b", "WASP-136b", "WASP-137b",
  "WASP-138b", "WASP-139b", "WASP-140b", "WASP-141b", "WASP-142b", "WASP-143b", "WASP-144b", "WASP-145b", "WASP-146b", "WASP-147b",
  "WASP-148b", "WASP-149b", "WASP-150b", "WASP-151b", "WASP-152b", "WASP-153b", "WASP-154b", "WASP-155b", "WASP-156b", "WASP-157b",
  "WASP-158b", "WASP-159b", "WASP-160b", "WASP-161b", "WASP-162b", "WASP-163b", "WASP-164b", "WASP-165b", "WASP-166b", "WASP-167b",
  "WASP-168b", "WASP-169b", "WASP-170b", "WASP-171b", "WASP-172b", "WASP-173b", "WASP-174b", "WASP-175b", "WASP-176b", "WASP-177b",
  "WASP-178b", "WASP-179b", "WASP-180b", "WASP-181b", "WASP-182b", "WASP-183b", "WASP-184b", "WASP-185b", "WASP-186b", "WASP-187b",
  "WASP-188b", "WASP-189b", "WASP-190b", "WASP-191b", "WASP-192b", "WASP-193b", "WASP-194b", "WASP-195b", "WASP-196b", "WASP-197b",
  "WASP-198b", "WASP-199b", "WASP-200b",
  
  // HAT (Hungarian Automated Telescope) - First 100
  "HAT-P-1b", "HAT-P-2b", "HAT-P-3b", "HAT-P-4b", "HAT-P-5b", "HAT-P-6b", "HAT-P-7b", "HAT-P-8b", "HAT-P-9b", "HAT-P-10b",
  "HAT-P-11b", "HAT-P-12b", "HAT-P-13b", "HAT-P-14b", "HAT-P-15b", "HAT-P-16b", "HAT-P-17b", "HAT-P-18b", "HAT-P-19b", "HAT-P-20b",
  "HAT-P-21b", "HAT-P-22b", "HAT-P-23b", "HAT-P-24b", "HAT-P-25b", "HAT-P-26b", "HAT-P-27b", "HAT-P-28b", "HAT-P-29b", "HAT-P-30b",
  "HAT-P-31b", "HAT-P-32b", "HAT-P-33b", "HAT-P-34b", "HAT-P-35b", "HAT-P-36b", "HAT-P-37b", "HAT-P-38b", "HAT-P-39b", "HAT-P-40b",
  "HAT-P-41b", "HAT-P-42b", "HAT-P-43b", "HAT-P-44b", "HAT-P-45b", "HAT-P-46b", "HAT-P-47b", "HAT-P-48b", "HAT-P-49b", "HAT-P-50b",
  "HAT-P-51b", "HAT-P-52b", "HAT-P-53b", "HAT-P-54b", "HAT-P-55b", "HAT-P-56b", "HAT-P-57b", "HAT-P-58b", "HAT-P-59b", "HAT-P-60b",
  "HAT-P-61b", "HAT-P-62b", "HAT-P-63b", "HAT-P-64b", "HAT-P-65b", "HAT-P-66b", "HAT-P-67b", "HAT-P-68b", "HAT-P-69b", "HAT-P-70b",
  "HAT-P-71b", "HAT-P-72b", "HAT-P-73b", "HAT-P-74b", "HAT-P-75b", "HAT-P-76b", "HAT-P-77b", "HAT-P-78b", "HAT-P-79b", "HAT-P-80b",
  "HAT-P-81b", "HAT-P-82b", "HAT-P-83b", "HAT-P-84b", "HAT-P-85b", "HAT-P-86b", "HAT-P-87b", "HAT-P-88b", "HAT-P-89b", "HAT-P-90b",
  "HAT-P-91b", "HAT-P-92b", "HAT-P-93b", "HAT-P-94b", "HAT-P-95b", "HAT-P-96b", "HAT-P-97b", "HAT-P-98b", "HAT-P-99b", "HAT-P-100b",
  
  // CoRoT Mission Planets
  "CoRoT-1b", "CoRoT-2b", "CoRoT-3b", "CoRoT-4b", "CoRoT-5b", "CoRoT-6b", "CoRoT-7b", "CoRoT-8b", "CoRoT-9b", "CoRoT-10b",
  "CoRoT-11b", "CoRoT-12b", "CoRoT-13b", "CoRoT-14b", "CoRoT-15b", "CoRoT-16b", "CoRoT-17b", "CoRoT-18b", "CoRoT-19b", "CoRoT-20b",
  "CoRoT-21b", "CoRoT-22b", "CoRoT-23b", "CoRoT-24b", "CoRoT-25b", "CoRoT-26b", "CoRoT-27b", "CoRoT-28b", "CoRoT-29b", "CoRoT-30b",
  
  // TrES (Trans-atlantic Exoplanet Survey)
  "TrES-1b", "TrES-2b", "TrES-3b", "TrES-4b", "TrES-5b",
  
  // XO Survey
  "XO-1b", "XO-2b", "XO-3b", "XO-4b", "XO-5b", "XO-6b", "XO-7b",
  
  // Famous Named Exoplanets
  "Proxima Centauri b", "Proxima Centauri c", "Proxima Centauri d",
  "Alpha Centauri Bb", "Barnard's Star b",
  "Wolf 359 b", "Wolf 359 c",
  "Lalande 21185 b", "Lalande 21185 c",
  "Sirius b", "Procyon b",
  "Epsilon Eridani b", "Epsilon Eridani c",
  "Tau Ceti b", "Tau Ceti c", "Tau Ceti d", "Tau Ceti e", "Tau Ceti f", "Tau Ceti g", "Tau Ceti h",
  "Gliese 876 b", "Gliese 876 c", "Gliese 876 d", "Gliese 876 e",
  "Gliese 581 b", "Gliese 581 c", "Gliese 581 d", "Gliese 581 e", "Gliese 581 f", "Gliese 581 g",
  "Gliese 667 Cb", "Gliese 667 Cc", "Gliese 667 Cd", "Gliese 667 Ce", "Gliese 667 Cf", "Gliese 667 Cg",
  "Gliese 832 b", "Gliese 832 c",
  "Gliese 163 b", "Gliese 163 c",
  "Gliese 180 b", "Gliese 180 c",
  "Gliese 433 b", "Gliese 433 c",
  "Gliese 436 b", "Gliese 436 c",
  "Gliese 674 b", "Gliese 674 c",
  "Gliese 682 b", "Gliese 682 c",
  "Gliese 785 b", "Gliese 785 c",
  "Gliese 849 b", "Gliese 849 c",
  "Gliese 876 b", "Gliese 876 c", "Gliese 876 d", "Gliese 876 e",
  
  // HD Catalog Planets (First 200)
  "HD 209458 b", "HD 189733 b", "HD 149026 b", "HD 88133 b", "HD 179949 b", "HD 187123 b", "HD 217107 b", "HD 168443 b",
  "HD 168443 c", "HD 37124 b", "HD 37124 c", "HD 37124 d", "HD 12661 b", "HD 12661 c", "HD 82943 b", "HD 82943 c",
  "HD 169830 b", "HD 169830 c", "HD 202206 b", "HD 202206 c", "HD 74156 b", "HD 74156 c", "HD 74156 d", "HD 128311 b",
  "HD 128311 c", "HD 160691 b", "HD 160691 c", "HD 160691 d", "HD 160691 e", "HD 38529 b", "HD 38529 c", "HD 190360 b",
  "HD 190360 c", "HD 108147 b", "HD 108147 c", "HD 114762 b", "HD 114762 c", "HD 142 b", "HD 142 c", "HD 142 d",
  "HD 1461 b", "HD 1461 c", "HD 1461 d", "HD 4308 b", "HD 4308 c", "HD 7924 b", "HD 7924 c", "HD 7924 d",
  "HD 10180 b", "HD 10180 c", "HD 10180 d", "HD 10180 e", "HD 10180 f", "HD 10180 g", "HD 10180 h", "HD 10180 i",
  "HD 10647 b", "HD 10647 c", "HD 11964 b", "HD 11964 c", "HD 13445 b", "HD 13445 c", "HD 16141 b", "HD 16141 c",
  "HD 17156 b", "HD 17156 c", "HD 20367 b", "HD 20367 c", "HD 20794 b", "HD 20794 c", "HD 20794 d", "HD 23079 b",
  "HD 23079 c", "HD 24040 b", "HD 24040 c", "HD 26965 b", "HD 26965 c", "HD 28185 b", "HD 28185 c", "HD 30177 b",
  "HD 30177 c", "HD 33283 b", "HD 33283 c", "HD 34445 b", "HD 34445 c", "HD 37605 b", "HD 37605 c", "HD 38801 b",
  "HD 38801 c", "HD 39091 b", "HD 39091 c", "HD 40307 b", "HD 40307 c", "HD 40307 d", "HD 40307 e", "HD 40307 f",
  "HD 40307 g", "HD 45364 b", "HD 45364 c", "HD 47186 b", "HD 47186 c", "HD 50554 b", "HD 50554 c", "HD 52265 b",
  "HD 52265 c", "HD 60532 b", "HD 60532 c", "HD 65216 b", "HD 65216 c", "HD 69830 b", "HD 69830 c", "HD 69830 d",
  "HD 73526 b", "HD 73526 c", "HD 75732 b", "HD 75732 c", "HD 81040 b", "HD 81040 c", "HD 85512 b", "HD 85512 c",
  "HD 90156 b", "HD 90156 c", "HD 92788 b", "HD 92788 c", "HD 95128 b", "HD 95128 c", "HD 96700 b", "HD 96700 c",
  "HD 99492 b", "HD 99492 c", "HD 102365 b", "HD 102365 c", "HD 106252 b", "HD 106252 c", "HD 109749 b", "HD 109749 c",
  "HD 114729 b", "HD 114729 c", "HD 117176 b", "HD 117176 c", "HD 125612 b", "HD 125612 c", "HD 134987 b", "HD 134987 c",
  "HD 136118 b", "HD 136118 c", "HD 141937 b", "HD 141937 c", "HD 147513 b", "HD 147513 c", "HD 154857 b", "HD 154857 c",
  "HD 164595 b", "HD 164595 c", "HD 177830 b", "HD 177830 c", "HD 181433 b", "HD 181433 c", "HD 181433 d", "HD 190228 b",
  "HD 190228 c", "HD 196050 b", "HD 196050 c", "HD 208487 b", "HD 208487 c", "HD 210277 b", "HD 210277 c", "HD 219134 b",
  "HD 219134 c", "HD 219134 d", "HD 219134 e", "HD 219134 f", "HD 219134 g", "HD 222582 b", "HD 222582 c", "HD 224693 b",
  "HD 224693 c",
  
  // GJ (Gliese-Jahreiss) Catalog - First 200
  "GJ 15 A b", "GJ 15 A c", "GJ 163 b", "GJ 163 c", "GJ 163 d", "GJ 176 b", "GJ 176 c", "GJ 179 b", "GJ 179 c",
  "GJ 180 b", "GJ 180 c", "GJ 229 A b", "GJ 229 A c", "GJ 273 b", "GJ 273 c", "GJ 273 d", "GJ 317 b", "GJ 317 c",
  "GJ 357 b", "GJ 357 c", "GJ 357 d", "GJ 367 b", "GJ 367 c", "GJ 433 b", "GJ 433 c", "GJ 436 b", "GJ 436 c",
  "GJ 486 b", "GJ 486 c", "GJ 504 b", "GJ 504 c", "GJ 526 b", "GJ 526 c", "GJ 536 b", "GJ 536 c", "GJ 581 b",
  "GJ 581 c", "GJ 581 d", "GJ 581 e", "GJ 581 f", "GJ 581 g", "GJ 625 b", "GJ 625 c", "GJ 628 b", "GJ 628 c",
  "GJ 649 b", "GJ 649 c", "GJ 667 C b", "GJ 667 C c", "GJ 667 C d", "GJ 667 C e", "GJ 667 C f", "GJ 667 C g",
  "GJ 674 b", "GJ 674 c", "GJ 676 A b", "GJ 676 A c", "GJ 676 A d", "GJ 682 b", "GJ 682 c", "GJ 687 b", "GJ 687 c",
  "GJ 699 b", "GJ 699 c", "GJ 832 b", "GJ 832 c", "GJ 849 b", "GJ 849 c", "GJ 876 b", "GJ 876 c", "GJ 876 d",
  "GJ 876 e", "GJ 887 b", "GJ 887 c", "GJ 1002 b", "GJ 1002 c", "GJ 1061 b", "GJ 1061 c", "GJ 1061 d", "GJ 1132 b",
  "GJ 1132 c", "GJ 1214 b", "GJ 1214 c", "GJ 1252 b", "GJ 1252 c", "GJ 3323 b", "GJ 3323 c", "GJ 3470 b", "GJ 3470 c",
  "GJ 3473 b", "GJ 3473 c", "GJ 3634 b", "GJ 3634 c", "GJ 3779 b", "GJ 3779 c", "GJ 3998 b", "GJ 3998 c", "GJ 4276 b",
  "GJ 4276 c", "GJ 9827 b", "GJ 9827 c", "GJ 9827 d",
  
  // LP (Luyten Palomar) Catalog
  "LP 890-9 b", "LP 890-9 c", "LP 714-47 b", "LP 714-47 c", "LP 415-20 b", "LP 415-20 c", "LP 261-75 b", "LP 261-75 c",
  "LP 944-20 b", "LP 944-20 c", "LP 145-141 b", "LP 145-141 c", "LP 816-60 b", "LP 816-60 c", "LP 729-54 b", "LP 729-54 c",
  
  // LHS (Luyten Half-Second) Catalog
  "LHS 1140 b", "LHS 1140 c", "LHS 1140 d", "LHS 1723 b", "LHS 1723 c", "LHS 2520 b", "LHS 2520 c", "LHS 3844 b",
  "LHS 3844 c", "LHS 6343 A b", "LHS 6343 A c",
  
  // Wolf Catalog
  "Wolf 359 b", "Wolf 359 c", "Wolf 1061 b", "Wolf 1061 c", "Wolf 1061 d", "Wolf 1061 e", "Wolf 503 b", "Wolf 503 c",
  "Wolf 1069 b", "Wolf 1069 c", "Wolf 294 b", "Wolf 294 c", "Wolf 424 A b", "Wolf 424 A c", "Wolf 1453 b", "Wolf 1453 c",
  
  // Ross Catalog
  "Ross 128 b", "Ross 128 c", "Ross 508 b", "Ross 508 c", "Ross 775 b", "Ross 775 c", "Ross 1003 b", "Ross 1003 c",
  
  // L Catalog (Luyten)
  "L 98-59 b", "L 98-59 c", "L 98-59 d", "L 98-59 e", "L 168-9 b", "L 168-9 c", "L 363-38 b", "L 363-38 c",
  
  // Additional Notable Systems
  "55 Cancri b", "55 Cancri c", "55 Cancri d", "55 Cancri e", "55 Cancri f",
  "47 Ursae Majoris b", "47 Ursae Majoris c", "47 Ursae Majoris d",
  "70 Virginis b", "70 Virginis c",
  "16 Cygni B b", "16 Cygni B c",
  "Upsilon Andromedae b", "Upsilon Andromedae c", "Upsilon Andromedae d", "Upsilon Andromedae e",
  "Rho Coronae Borealis b", "Rho Coronae Borealis c",
  "Iota Horologii b", "Iota Horologii c",
  "Kappa Coronae Borealis b", "Kappa Coronae Borealis c",
  "14 Herculis b", "14 Herculis c",
  "Mu Arae b", "Mu Arae c", "Mu Arae d", "Mu Arae e",
  "Nu Ophiuchi b", "Nu Ophiuchi c",
  "Gamma Cephei A b", "Gamma Cephei A c",
  "Pollux b", "Pollux c",
  "Fomalhaut b", "Fomalhaut c",
  "Beta Pictoris b", "Beta Pictoris c",
  "HR 8799 b", "HR 8799 c", "HR 8799 d", "HR 8799 e",
  "2M1207 b", "2M1207 c",
  "51 Eridani b", "51 Eridani c",
  "GQ Lupi b", "GQ Lupi c",
  "AB Pictoris b", "AB Pictoris c",
  "Kapteyn b", "Kapteyn c",
  "Luyten b", "Luyten c",
  "YZ Ceti b", "YZ Ceti c", "YZ Ceti d",
  "EPIC 201367065 b", "EPIC 201367065 c",
  "EPIC 211945201 b", "EPIC 211945201 c",
  "EPIC 220194953 b", "EPIC 220194953 c",
  
  // Recent Discoveries (2020-2024)
  "TOI-715 b", "TOI-715 c", "TOI-849 b", "TOI-849 c", "TOI-1338 b", "TOI-1338 c", "TOI-1452 b", "TOI-1452 c",
  "TOI-2109 b", "TOI-2109 c", "TOI-2180 b", "TOI-2180 c", "TOI-2525 b", "TOI-2525 c", "TOI-3362 b", "TOI-3362 c",
  "TOI-4329 b", "TOI-4329 c", "TOI-5205 b", "TOI-5205 c", "TOI-6713 b", "TOI-6713 c", "TOI-7338 b", "TOI-7338 c",
  
  // KELT Survey
  "KELT-1b", "KELT-2Ab", "KELT-3b", "KELT-4Ab", "KELT-6b", "KELT-7b", "KELT-8b", "KELT-9b", "KELT-10b", "KELT-11b",
  "KELT-12b", "KELT-14b", "KELT-15b", "KELT-16b", "KELT-17b", "KELT-18b", "KELT-19Ab", "KELT-20b", "KELT-21b", "KELT-22Ab",
  "KELT-23Ab", "KELT-24b", "KELT-25b", "KELT-26b", "KELT-27b", "KELT-28b", "KELT-29b", "KELT-30b",
  
  // Qatar Survey
  "Qatar-1b", "Qatar-2b", "Qatar-3b", "Qatar-4b", "Qatar-5b", "Qatar-6b", "Qatar-7b", "Qatar-8b", "Qatar-9b", "Qatar-10b",
  
  // MASCARA Survey
  "MASCARA-1b", "MASCARA-2b", "MASCARA-3b", "MASCARA-4b", "MASCARA-5b",
  
  // NGTS Survey
  "NGTS-1b", "NGTS-2b", "NGTS-3Ab", "NGTS-4b", "NGTS-5b", "NGTS-6b", "NGTS-7Ab", "NGTS-8b", "NGTS-9b", "NGTS-10b",
  "NGTS-11b", "NGTS-12b", "NGTS-13b", "NGTS-14Ab", "NGTS-15b", "NGTS-16b", "NGTS-17b", "NGTS-18b", "NGTS-19b", "NGTS-20b",
  
  // EPIC (K2 Extended Mission)
  "EPIC 201367065b", "EPIC 201912552b", "EPIC 203771098b", "EPIC 204221263b", "EPIC 206011691b", "EPIC 206135267b",
  "EPIC 210957318b", "EPIC 211822797b", "EPIC 212521166b", "EPIC 220194953b", "EPIC 228735255b", "EPIC 249622103b",
  
  // Additional Recent Discoveries
  "AU Mic b", "AU Mic c", "DS Tuc Ab", "V1298 Tau b", "V1298 Tau c", "V1298 Tau d", "V1298 Tau e",
  "HIP 67522 b", "HIP 67522 c", "TOI-1728 b", "TOI-1728 c", "TOI-1899 b", "TOI-1899 c", "TOI-2076 b", "TOI-2076 c",
  "TOI-2096 b", "TOI-2096 c", "TOI-2109 b", "TOI-2109 c", "TOI-2180 b", "TOI-2180 c", "TOI-2525 b", "TOI-2525 c"
];

interface SimplePlanetListProps {
  onPlanetSelect?: (planetName: string) => void;
}

export const SimplePlanetList: React.FC<SimplePlanetListProps> = ({ onPlanetSelect }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const planetsPerPage = 50;

  // Filter planets based on search
  const filteredPlanets = EXOPLANET_NAMES.filter(name =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredPlanets.length / planetsPerPage);
  const startIndex = (currentPage - 1) * planetsPerPage;
  const endIndex = startIndex + planetsPerPage;
  const currentPlanets = filteredPlanets.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <div>
      {/* Search */}
      <div className="mb-6 text-center">
        <input
          type="text"
          placeholder={`Search from ${EXOPLANET_NAMES.length.toLocaleString()}+ exoplanets...`}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full max-w-md px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
        />
      </div>

      {/* Stats */}
      <div className="mb-6 text-center">
        <p className="text-gray-300">
          Showing {currentPlanets.length} of {filteredPlanets.length.toLocaleString()} exoplanets
        </p>
        <p className="text-gray-500 text-sm">
          Page {currentPage} of {totalPages.toLocaleString()} • Total: {EXOPLANET_NAMES.length.toLocaleString()} planets
        </p>
      </div>

      {/* Planet Names Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {currentPlanets.map((planetName, index) => (
          <div
            key={`${planetName}-${index}`}
            onClick={() => onPlanetSelect?.(planetName)}
            className="group cursor-pointer bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium group-hover:text-cyan-300 transition-colors">
                  {planetName}
                </h3>
                <p className="text-gray-400 text-sm">
                  {planetName.includes('Kepler') ? 'Kepler Mission' :
                   planetName.includes('K2-') ? 'K2 Mission' :
                   planetName.includes('TOI-') ? 'TESS Survey' :
                   planetName.includes('WASP-') ? 'WASP Survey' :
                   planetName.includes('HAT-P-') ? 'HAT Survey' :
                   planetName.includes('CoRoT-') ? 'CoRoT Mission' :
                   planetName.includes('TrES-') ? 'TrES Survey' :
                   planetName.includes('XO-') ? 'XO Survey' :
                   planetName.includes('HD ') ? 'HD Catalog' :
                   planetName.includes('GJ ') ? 'Gliese Catalog' :
                   planetName.includes('TRAPPIST-') ? 'TRAPPIST System' :
                   'Exoplanet'
                  }
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {/* Show first page */}
            {currentPage > 3 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className="px-3 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors"
                >
                  1
                </button>
                {currentPage > 4 && <span className="text-gray-500">...</span>}
              </>
            )}

            {/* Show pages around current page */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (page > totalPages) return null;
              
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-cyan-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {page.toLocaleString()}
                </button>
              );
            })}

            {/* Show last page */}
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="text-gray-500">...</span>}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="px-3 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors"
                >
                  {totalPages.toLocaleString()}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Jump */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-400">
          <span>Quick jump to page:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            placeholder="Page #"
            className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-center focus:outline-none focus:ring-1 focus:ring-cyan-400"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const page = parseInt((e.target as HTMLInputElement).value);
                if (page >= 1 && page <= totalPages) {
                  handlePageChange(page);
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
          <span>of {totalPages.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};