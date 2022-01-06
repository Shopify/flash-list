package com.flatlistpro

import com.flatlistpro.models.Rect
import com.flatlistpro.models.TestCollection
import com.flatlistpro.models.TestDataModel
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import org.junit.jupiter.api.Assertions.*

import org.junit.jupiter.api.Test

internal class AutoLayoutShadowTest {
    var gson = Gson()

    @Test
    fun clearGapsAndOverlapsVerticalList() {
        val alShadow = getAutolayoutShadow(0)
        val testModel = getTestModel()
        testModel.vertical.forEachIndexed { index, it ->
            alShadow.clearGapsAndOverlaps(it.input as Array<CellContainer>)
            assertEquals(gson.toJson(it.input), gson.toJson(it.expectedOutput), "Vertical Index: $index")
        }
    }

    @Test
    fun clearGapsAndOverlapsHorizontalList() {
        val alShadow = getAutolayoutShadow(0)
        alShadow.horizontal = true
        val testModel = getTestModel()
        testModel.horizontal.forEachIndexed { index, it ->
            alShadow.clearGapsAndOverlaps(it.input as Array<CellContainer>)
            assertEquals(gson.toJson(it.input), gson.toJson(it.expectedOutput), "Horizontal Index: $index")
        }
    }

    @Test
    fun clearGapsAndOverlapsWindowSize() {
        val alShadow = getAutolayoutShadow(0)
        alShadow.horizontal = true
        alShadow.windowSize = 90
        val testModel = getTestModel()
        testModel.window.forEachIndexed { index, it ->
            alShadow.clearGapsAndOverlaps(it.input as Array<CellContainer>)
            assertEquals(gson.toJson(it.input), gson.toJson(it.expectedOutput), "Window Index: $index")
        }
    }

    private fun getTestModel(): TestDataModel {
        var str = this.javaClass.classLoader.getResource("LayoutTestData.json").readText()
        return gson.fromJson<TestDataModel>(str, TestDataModel::class.java)
    }

    private fun getAutolayoutShadow(offset: Int): AutoLayoutShadow {
        val alShadow = AutoLayoutShadow()
        alShadow.windowSize = 500
        alShadow.renderOffset = 0
        alShadow.scrollOffset = offset
        return alShadow
    }
}