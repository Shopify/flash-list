cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE on)

file(GLOB rnoh_flash_list_SRC CONFIGURE_DEPENDS *.cpp)
add_library(rnoh_flash_list SHARED ${rnoh_flash_list_SRC})
target_include_directories(rnoh_flash_list PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
target_link_libraries(rnoh_flash_list PUBLIC rnoh)