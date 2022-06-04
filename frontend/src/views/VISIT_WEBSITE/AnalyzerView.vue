<template>
    <div class="row">
        <div class="mb-3 col-lg-5 col-md-5 d-none d-lg-block">
            <img :src="isDarkMode ? images.light : images.dark" class="img img-fluid" alt="Password Analyzer Image">
        </div>
        <div class="col-sm-12 col-md-12 col-lg-7 mb-3">
            <div class="card">
                <div class="card-body"
                    :class="{ 'bg-dark text-light border-light': isDarkMode, 'bg-light text-dark border-dark': !isDarkMode }">
                    <div class="card-title mt-2">
                        <div class="text-center">
                            <h3><strong><span
                                        :class="{ 'text-success': isDarkMode, 'text-danger': !isDarkMode }">Password</span>
                                    <span
                                        :class="{ 'text-success': !isDarkMode, 'text-danger': isDarkMode }">Analyzer</span></strong>
                            </h3>
                            <p>Let's Analyze the strength of your password.</p>
                        </div>
                    </div>
                    <div class="card-body">
                        <form v-on:submit="handleSubmit($event)" v-if="!isAnalyzing && !analysisComplete">
                            <p>Don't worry we won't store it anywhere.</p>
                            <div class="form-group mb-4">
                                <div class="form-floating text-dark">
                                    <input type="text" class="form-control" id="password" placeholder="Password"
                                        required>
                                    <label for="password">Password</label>
                                </div>
                            </div>
                            <div class="text-center mb-3">
                                <button type="submit" class="btn btn-primary">Analyze <i
                                        class="fas fa-cogs"></i></button>
                            </div>
                        </form>
                        <div class="text-center" v-else-if="isAnalyzing && !analysisComplete">
                            <div class="text-center mb-2">
                                <h3>
                                    <strong>Extracting features</strong>
                                    &nbsp;
                                    <div class=" spinner-border p-1 text-primary" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </h3>
                                <h3>
                                    <strong>Calculating Combinations</strong>
                                    &nbsp;
                                    <div class=" spinner-border p-1 text-success" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </h3>
                                <h3>
                                    <strong>Analyzing password</strong>
                                    &nbsp;
                                    <div class=" spinner-border p-1 text-danger" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </h3>
                            </div>
                        </div>
                        <div v-else
                            :class="{ 'text-light bg-transparent': isDarkMode, 'text-dark bg-transparent': !isDarkMode }">
                            <div class="card-title mb-3">
                                <h4><strong> Password Analysis Report 📝</strong></h4>
                            </div>
                            <div>
                                <div class="row mb-3">
                                    <div class="col-sm-12 col-md-12 col-lg-12 mb-3">
                                        <h5 class="card-title text-center">Basic Information 📊</h5>
                                        <table class="table table-responsive-sm table-striped table-bordered"
                                            :class="{ 'table-light': !isDarkMode, 'table-dark': isDarkMode }">
                                            <thead class="thead-inverse">
                                                <tr class="text-center">
                                                    <th>Label</th>
                                                    <th>Values</th>
                                                </tr>
                                            </thead>
                                            <tbody class="text-center">
                                                <tr>
                                                    <td scope="row">Selected password</td>
                                                    <td>{{ password }}</td>
                                                </tr>
                                                <tr>
                                                    <td scope="row">Total Length</td>
                                                    <td>{{ analysisData.features.length }}</td>
                                                </tr>
                                                <tr>
                                                    <td scope="row">Accepted Max length</td>
                                                    <td>{{ Configuration.length.max }}</td>
                                                </tr>
                                                <tr>
                                                    <td scope="row">Accepted Min length</td>
                                                    <td>{{ Configuration.length.min }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <table class="table table-responsive-sm table-striped table-bordered"
                                            :class="{ 'table-light': !isDarkMode, 'table-dark': isDarkMode }">
                                            <thead class="thead-inverse">
                                                <tr class="text-center">
                                                    <th>Character Types</th>
                                                    <th>Count</th>
                                                </tr>
                                            </thead>
                                            <tbody class="text-center">
                                                <tr>
                                                    <td scope="row">UpperCase</td>
                                                    <td>{{ analysisData.features.characterCount.uppercase }}</td>
                                                </tr>
                                                <tr>
                                                    <td scope="row">LowerCase</td>
                                                    <td>{{ analysisData.features.characterCount.lowercase }}</td>
                                                </tr>
                                                <tr>
                                                    <td scope="row">Numbers</td>
                                                    <td>{{ analysisData.features.characterCount.number }}</td>
                                                </tr>
                                                <tr>
                                                    <td scope="row">SpecialCharacter</td>
                                                    <td>{{ analysisData.features.characterCount.specialCharacters }}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td scope="row">WhiteSpace</td>
                                                    <td>{{ analysisData.features.characterCount.whiteSpace }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="col-sm-12 col-md-12 col-lg-12 pl-3 pr-3 mb-3">
                                        <h5 class="card-title"><strong>Extra Information 📚</strong></h5>
                                        <p>
                                            <span>
                                                <strong>Repeated Characters: </strong><br><br>
                                                <span v-for="(character, index) in repeatingCharacters"
                                                    v-bind:key="index">
                                                    <span class="link btn-sm btn-primary position-relative">
                                                        <strong>{{ character.charKey }}</strong>
                                                        <span
                                                            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                                            {{ character.value }}
                                                        </span>
                                                    </span>
                                                    &nbsp;
                                                    &nbsp;
                                                </span>
                                            </span>
                                            <br>
                                            <br>
                                            <span>
                                                <strong>Possible Combinations: </strong>
                                                {{ analysisData.features.combinations }} possible combinations.
                                            </span>
                                            <br>
                                            <br>
                                            <span>
                                                <strong>Strength Matrix: </strong>
                                                <br>
                                                <br>
                                                <table class="table table-responsive-sm table-striped table-bordered"
                                                    :class="{ 'table-light': !isDarkMode, 'table-dark': isDarkMode }">
                                                    <thead class="thead-inverse">
                                                        <tr class="text-center">
                                                            <th>Label</th>
                                                            <th>Count</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody class="text-center">
                                                        <tr>
                                                            <td scope="row">Length Strength</td>
                                                            <td>{{ analysisData.features.strength.length }}</td>
                                                        </tr>
                                                        <tr data-bs-toggle="tooltip" data-bs-placement="left"
                                                            title="Sum percentage of all character types based on probability">
                                                            <td scope="row">Character Coverage</td>
                                                            <td>{{ analysisData.features.strength.characterCoverage
                                                            }}%</td>
                                                        </tr>
                                                        <tr data-bs-toggle="tooltip" data-bs-placement="left"
                                                            title="Percentage of letter included out of max length">
                                                            <td scope="row">Word strength</td>
                                                            <td>{{ analysisData.features.strength.wordPercent }}%
                                                            </td>
                                                        </tr>
                                                        <tr data-bs-toggle="tooltip" data-bs-placement="left"
                                                            title="Average of character coverage & word strength">
                                                            <td scope="row">Total Average strength</td>
                                                            <td>{{
                                                                    analysisData.features.strength.totalPercent
                                                            }}%
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </span>
                                            <br>
                                            <span>
                                                <strong>Acceptability: </strong>
                                                <span
                                                    :class="{ 'text-success': analysisData.features.acceptable, 'text-danger': !analysisData.features.acceptable }">
                                                    Password is {{ analysisData.features.acceptable ? 'Acceptable' :
                                                            "Not Acceptable"
                                                    }} as per the average total strength.</span>
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div class="text-center mb-3">
                                    <strong><span class="text-primary">Message:</span> {{ analysisData.message
                                    }}</strong>
                                </div>
                                <div class="text-center mb-3">
                                    <a href="#" class="btn btn-success" v-on:click="resetForm">Try Another Password
                                        <i class="fas
                                            fa-asterisk">
                                        </i> </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>

// Import Password Analyzer
import PasswordAnalyzer from "../../../../library/security/lib.password.analyzer";
const Analyzer = new PasswordAnalyzer();
export default {
    name: 'Analyzer',
    computed: {
        isDarkMode() {
            return this.$store.getters.appMode;
        },
        isLoggedIn() {
            return this.$store.getters.loggedIn;
        },
    },
    data() {
        return {
            isAnalyzing: false,
            analysisComplete: false,
            analysisData: {},
            password: "",
            Configuration: PasswordAnalyzer.Configuration,
            repeatingCharacters: [],
            images: {
                dark: require('@/assets/analyzer-cuate-dark.svg'),
                light: require('@/assets/analyzer-cuate-light.svg'),
            }
        }
    },
    methods: {
        handleSubmit(e) {
            e.preventDefault();
            this.isAnalyzing = true;
            setTimeout(() => {
                this.analysisData = Analyzer.setPassword(e.target.password.value);
                this.password = e.target.password.value;
                this.analysisComplete = true;
                this.getRepeatingCharacters();
                e.target.password.value = "";
            }, 1e3);
        },
        resetForm() {
            this.isAnalyzing = false;
            this.analysisComplete = false;
            this.analysisData = {};
            this.password = "";
            this.repeatingCharacters = [];
        },
        getRepeatingCharacters() {
            for (const key in this.analysisData.features.repeatingCharacters) {
                if (Object.hasOwnProperty.call(this.analysisData.features.repeatingCharacters, key)) {
                    const types = this.analysisData.features.repeatingCharacters[key];
                    for (const charKey in types) {
                        if (Object.hasOwnProperty.call(types, charKey)) {
                            const value = types[charKey];
                            this.repeatingCharacters.push({ charKey, value });
                        }
                    }
                }
            }
        }
    }
}
</script>